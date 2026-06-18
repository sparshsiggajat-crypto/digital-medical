import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MailWarning, 
  CheckCheck,
  BellRing
} from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => Promise<any>;
  onMarkAllRead: () => Promise<any>;
}

export default function Notifications({ notifications, onMarkRead, onMarkAllRead }: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      
      {/* Notifications Header banner */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
            <BellRing className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">System Alerts & Diagnostics</h3>
            <p className="text-xs text-gray-400">Automated warning monitors for stock, product expiries, and server status</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="text-xs bg-blue-50 text-blue-700 font-bold px-4 py-2 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Handled</span>
          </button>
        )}
      </div>

      {/* Notifications feed list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-900">All alerts resolved</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No active warnings is triggered today. Health levels: 100%.
            </p>
          </div>
        ) : (
          notifications.map(notif => {
            const isLowStock = notif.type === 'low_stock';
            const isExpiry = notif.type === 'expiry';

            return (
              <div 
                key={notif.id} 
                className={`p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors ${
                  !notif.isRead ? "bg-amber-50/5 border-l-4 border-l-amber-500" : ""
                }`}
              >
                {/* Alert Icon */}
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  isLowStock ? "bg-amber-100/70 text-amber-600" :
                  isExpiry ? "bg-rose-100/70 text-rose-650" :
                  "bg-blue-100/70 text-blue-600"
                }`}>
                  {isLowStock ? <AlertTriangle className="w-5 h-5" /> :
                   isExpiry ? <Clock className="w-5 h-5" /> :
                   <MailWarning className="w-5 h-5" />}
                </div>

                {/* Info Text */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase ${
                      isLowStock ? "text-amber-700" : 
                      isExpiry ? "text-rose-700" : 
                      "text-blue-700"
                    }`}>
                      {isLowStock ? 'Stock Alert' : isExpiry ? 'Medication Expiry' : 'Server Dispatch'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {new Date(notif.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                    {notif.message}
                  </p>
                  
                  {/* Mark as read button if unread */}
                  {!notif.isRead && (
                    <button 
                      onClick={() => onMarkRead(notif.id)}
                      className="text-[11px] text-blue-600 font-bold hover:underline block pt-1 hover:text-blue-800"
                    >
                      Acknowledge warning
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
