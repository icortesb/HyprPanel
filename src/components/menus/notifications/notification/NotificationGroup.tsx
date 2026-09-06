import AstalNotifd from 'gi://AstalNotifd?version=0.1';
import { Gtk } from 'astal/gtk3';
import { Variable } from 'astal';
import { NotificationCard } from 'src/components/notifications/Notification';
import { isPrimaryClick } from 'src/lib/events/mouse';
import { clearNotifications, getNotificationIcon, NotificationGroup } from 'src/lib/shared/notifications';
import options from 'src/configuration';

const { clearDelay } = options.notifications;

/**
 * The keys of the groups the user has expanded.
 *
 * The notification list is rebuilt whenever a notification arrives or is dismissed, so the expanded
 * state can't live in the widgets themselves. Keeping it here also lets the list rebuild itself when
 * a group is toggled.
 */
export const expandedGroups = Variable<string[]>([]);

/**
 * Expands a collapsed group, or collapses an expanded one.
 *
 * @param key The key of the group to toggle.
 */
const toggleGroup = (key: string): void => {
    const expanded = expandedGroups.get();

    expandedGroups.set(expanded.includes(key) ? expanded.filter((k) => k !== key) : [...expanded, key]);
};

/**
 * Returns the line shown under the application's name in a group header.
 *
 * Applications commonly repeat their own name in a notification's summary, which would leave the
 * header showing the same text twice. The body is more informative when that happens.
 *
 * @param notification The most recent notification of the group.
 */
const getGroupPreview = (notification: AstalNotifd.Notification): string => {
    const isSummaryRedundant = notification.summary.trim() === notification.appName.trim();

    return isSummaryRedundant ? notification.body : notification.summary;
};

const GroupHeader = ({ group, isExpanded }: GroupHeaderProps): JSX.Element => {
    const [latestNotification] = group.notifications;
    const { appName, appIcon, desktopEntry } = latestNotification;

    return (
        <eventbox
            onClick={(_, event) => {
                if (isPrimaryClick(event)) {
                    toggleGroup(group.key);
                }
            }}
        >
            <box className={'notification-group-header'} hexpand>
                <box css={'min-width: 2rem; min-height: 2rem;'}>
                    <icon
                        className={'notification-icon'}
                        icon={getNotificationIcon(appName, appIcon, desktopEntry)}
                    />
                </box>
                <box vertical halign={Gtk.Align.START} valign={Gtk.Align.CENTER} hexpand>
                    <label
                        className={'notification-group-app-label'}
                        halign={Gtk.Align.START}
                        label={appName}
                        maxWidthChars={24}
                        truncate
                    />
                    <label
                        className={'notification-group-summary-label'}
                        halign={Gtk.Align.START}
                        label={getGroupPreview(latestNotification)}
                        maxWidthChars={28}
                        truncate
                    />
                </box>
                <label
                    className={'notification-group-count'}
                    valign={Gtk.Align.CENTER}
                    label={`${group.notifications.length}`}
                />
                <label
                    className={'notification-group-expander'}
                    valign={Gtk.Align.CENTER}
                    label={isExpanded ? '' : ''}
                />
                <button
                    className={'close-notification-button menu group'}
                    onClick={() => {
                        clearNotifications(group.notifications, clearDelay.get());
                    }}
                >
                    <label className={'txt-icon notification-close'} label={'󰅜'} halign={Gtk.Align.CENTER} />
                </button>
            </box>
        </eventbox>
    );
};

/**
 * Renders every notification of a single application under one collapsible header.
 *
 * @param group The group of notifications to render.
 * @param showActions Whether notification actions are only revealed on hover.
 * @param isExpanded Whether the group is currently expanded.
 */
export const NotificationGroupCard = ({
    group,
    showActions,
    isExpanded,
}: NotificationGroupCardProps): JSX.Element => {
    return (
        <box className={'notification-group'} valign={Gtk.Align.START} hexpand vertical>
            <GroupHeader group={group} isExpanded={isExpanded} />
            <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN} revealChild={isExpanded}>
                <box className={'notification-group-children'} vertical>
                    {group.notifications.map((notification) => {
                        return (
                            <NotificationCard
                                className={'notification-card menu grouped'}
                                notification={notification}
                                showActions={showActions}
                            />
                        );
                    })}
                </box>
            </revealer>
        </box>
    );
};

interface GroupHeaderProps {
    group: NotificationGroup;
    isExpanded: boolean;
}

interface NotificationGroupCardProps extends GroupHeaderProps {
    showActions: boolean;
}
