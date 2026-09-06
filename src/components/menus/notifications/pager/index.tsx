import { bind, Variable } from 'astal';
import { Gtk } from 'astal/gtk3';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';
import { FirstPageButton, LastPageButton, NextPageButton, PreviousPageButton } from './Buttons';
import options from 'src/configuration';
import { getNotificationGroups } from 'src/lib/shared/notifications';

const notifdService = AstalNotifd.get_default();

const { displayedTotal, ignore, grouped } = options.notifications;
const { show: showPager } = options.theme.bar.menus.menu.notifications.pager;

const PageDisplay = ({ totalItems, currentPage, dispTotal }: PageDisplayProps): JSX.Element => {
    return (
        <label
            hexpand={true}
            halign={Gtk.Align.CENTER}
            className={'pager-label'}
            label={`${currentPage} / ${Math.ceil(totalItems / dispTotal) || 1}`}
        />
    );
};

export const NotificationPager = ({ curPage }: NotificationPagerProps): JSX.Element => {
    const pagerBinding = Variable.derive(
        [
            bind(curPage),
            bind(displayedTotal),
            bind(notifdService, 'notifications'),
            bind(showPager),
            bind(ignore),
            bind(grouped),
        ],
        (currentPage, dispTotal, notifications, showPgr, ignored, isGrouped) => {
            const totalItems = getNotificationGroups(notifications, ignored, isGrouped).length;

            if (showPgr === false || (currentPage === 1 && totalItems <= dispTotal)) {
                return <box />;
            }

            return (
                <box>
                    <FirstPageButton curPage={curPage} currentPage={currentPage} />
                    <PreviousPageButton curPage={curPage} currentPage={currentPage} />
                    <PageDisplay totalItems={totalItems} currentPage={currentPage} dispTotal={dispTotal} />
                    <NextPageButton
                        curPage={curPage}
                        currentPage={currentPage}
                        totalItems={totalItems}
                        displayedTotal={displayedTotal}
                        dispTotal={dispTotal}
                    />
                    <LastPageButton
                        curPage={curPage}
                        currentPage={currentPage}
                        totalItems={totalItems}
                        displayedTotal={displayedTotal}
                        dispTotal={dispTotal}
                    />
                </box>
            );
        },
    );

    return (
        <box
            className={'notification-menu-pager'}
            hexpand={true}
            vexpand={false}
            onDestroy={() => {
                pagerBinding.drop();
            }}
        >
            {pagerBinding()}
        </box>
    );
};

interface NotificationPagerProps {
    curPage: Variable<number>;
}

interface PageDisplayProps {
    totalItems: number;
    currentPage: number;
    dispTotal: number;
}
