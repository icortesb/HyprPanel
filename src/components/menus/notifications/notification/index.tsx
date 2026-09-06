import AstalNotifd from 'gi://AstalNotifd?version=0.1';
import { Gtk } from 'astal/gtk3';
import { bind, Variable } from 'astal';
import { Placeholder } from './Placeholder';
import { expandedGroups, NotificationGroupCard } from './NotificationGroup';
import { NotificationCard } from 'src/components/notifications/Notification';
import options from 'src/configuration';
import { getNotificationGroups, NotificationGroup } from 'src/lib/shared/notifications';

const notifdService = AstalNotifd.get_default();

const { displayedTotal, ignore, showActionsOnHover, grouped } = options.notifications;

export const NotificationsContainer = ({ curPage }: NotificationsContainerProps): JSX.Element => {
    return (
        <scrollable vscroll={Gtk.PolicyType.AUTOMATIC}>
            <box
                className={'menu-content-container notifications'}
                halign={Gtk.Align.FILL}
                spacing={0}
                vexpand
            >
                {Variable.derive(
                    [
                        bind(notifdService, 'notifications'),
                        bind(curPage),
                        bind(displayedTotal),
                        bind(ignore),
                        bind(showActionsOnHover),
                        bind(grouped),
                        bind(expandedGroups),
                    ],
                    (
                        notifications,
                        currentPage,
                        totalDisplayed,
                        ignored,
                        hoverActions,
                        isGrouped,
                        expanded,
                    ) => {
                        const notificationGroups = getNotificationGroups(notifications, ignored, isGrouped);

                        if (notificationGroups.length <= 0) {
                            return <Placeholder />;
                        }

                        const pageStart = (currentPage - 1) * totalDisplayed;
                        const pageEnd = currentPage * totalDisplayed;

                        return (
                            <box
                                className={'notification-card-content-container'}
                                valign={Gtk.Align.START}
                                vexpand={false}
                                vertical
                            >
                                {notificationGroups
                                    .slice(pageStart, pageEnd)
                                    .map((notificationGroup: NotificationGroup) => {
                                        const [notification] = notificationGroup.notifications;

                                        if (notificationGroup.notifications.length === 1) {
                                            return (
                                                <NotificationCard
                                                    className={'notification-card menu'}
                                                    notification={notification}
                                                    showActions={hoverActions}
                                                />
                                            );
                                        }

                                        return (
                                            <NotificationGroupCard
                                                group={notificationGroup}
                                                showActions={hoverActions}
                                                isExpanded={expanded.includes(notificationGroup.key)}
                                            />
                                        );
                                    })}
                            </box>
                        );
                    },
                )()}
            </box>
        </scrollable>
    );
};

interface NotificationsContainerProps {
    curPage: Variable<number>;
}
