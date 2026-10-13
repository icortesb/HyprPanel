import AstalMpris from 'gi://AstalMpris?version=0.1';
import options from 'src/configuration';

const normalizeName = (name: string): string => name.toLowerCase().replace(/\s+/g, '_');

/**
 * Checks if a player lacks the track info its identity requires.
 *
 * Browsers expose a single MPRIS player per instance, and any tab that plays a sound
 * (a webmail notification, a draft) takes it over with the page title and no artist.
 * Identities listed in `menus.media.requireTrackInfo` only count while they report
 * an artist and are not stopped, which keeps real media (e.g. YouTube) and drops the rest.
 *
 * @param player The MPRIS player to check.
 *
 * @returns True if the player's identity requires track info and the player has none.
 */
const lacksRequiredTrackInfo = (player: AstalMpris.Player): boolean => {
    const requireTrackInfo = new Set(options.menus.media.requireTrackInfo.get().map(normalizeName));

    if (!requireTrackInfo.has(normalizeName(player.identity || ''))) {
        return false;
    }

    return player.playbackStatus === AstalMpris.PlaybackStatus.STOPPED || !player.artist?.trim();
};

/**
 * Checks if a media player should be ignored based on the filter list.
 *
 * This function determines whether the provided MPRIS player should be filtered out
 * by checking the identity property, and whether it lacks the track info its identity requires.
 *
 * @param player The MPRIS player to check.
 * @param filter Array of identity names to ignore (e.g., ["Brave", "TIDAL Hi-Fi", "Zaap"]).
 *
 * @returns True if the player should be ignored, false otherwise.
 */
export const isPlayerIgnored = (player: AstalMpris.Player | null | undefined, filter: string[]): boolean => {
    if (!player) {
        return false;
    }

    const playerFilters = new Set(filter.map(normalizeName));

    const identity = player.identity || '';
    const normalizedIdentity = normalizeName(identity);

    return playerFilters.has(normalizedIdentity) || lacksRequiredTrackInfo(player);
};

/**
 * Filters a list of MPRIS players based on the ignore list.
 *
 * This function removes players from the list that match entries in the filter array.
 *
 * @param players Array of MPRIS players to filter.
 * @param filter Array of application names to ignore.
 *
 * @returns Filtered array of players.
 */
export const filterPlayers = (players: AstalMpris.Player[], filter: string[]): AstalMpris.Player[] => {
    const filteredPlayers = players.filter((player: AstalMpris.Player) => {
        return !isPlayerIgnored(player, filter);
    });

    return filteredPlayers;
};
