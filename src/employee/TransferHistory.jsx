import { useState, useEffect } from "react";
import { assetAPI } from "../apis/assetAPI";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { History, Package, CheckCircle, User, Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";

const TransferHistory = () => {
  const [assetHistory, setAssetHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { themeColors } = useTheme();

  useEffect(() => {
    fetchAssetHistory();
  }, []);

  const fetchAssetHistory = async () => {
    try {
      setLoading(true);
      const response = await assetAPI.getMyHistory();
      setAssetHistory(response.data?.history || []);
      setHistoryStats(response.data?.stats || null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch transfer history",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatName = (nameObj) => {
    if (!nameObj) return "N/A";
    if (typeof nameObj === "string") return nameObj;
    if (nameObj.first && nameObj.last)
      return `${nameObj.first} ${nameObj.last}`;
    return "N/A";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen" style={{ backgroundColor: themeColors.surface }}>
      {/* Header Card */}
      <div
        className="p-6 rounded-2xl shadow-lg text-white mb-6"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Asset Transfer History</h1>
              <p className="text-xs text-white/80 mt-1">Track your asset assignments and transfers</p>
            </div>
          </div>

          {historyStats && (
            <div className="flex gap-3 text-xs">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white/70">Total Assets</div>
                <div className="text-lg font-bold">{historyStats.totalAssetsUsed || 0}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white/70">Transferred</div>
                <div className="text-lg font-bold">{historyStats.assetsTransferred || 0}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white/70">Total Days</div>
                <div className="text-lg font-bold">{historyStats.totalDaysUsed || 0}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!assetHistory.length && (
        <div className="text-center py-24">
          <Package size={64} className="mx-auto mb-4" style={{ color: themeColors.primary, opacity: 0.3 }} />
          <p className="text-sm" style={{ color: themeColors.textSecondary }}>No asset transfer history found.</p>
        </div>
      )}

      {/* History Cards */}
      <div className="grid gap-4">
        {assetHistory.map((item, assetIndex) =>
          item.assignments.map((assignment, idx) => (
            <div
              key={`${assetIndex}-${idx}`}
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              style={{ 
                backgroundColor: themeColors.card,
                borderLeft: `4px solid ${item.transferredTo ? themeColors.warning : item.currentlyWithMe ? themeColors.success : themeColors.primary}`
              }}
            >
              <div className="p-5">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}15` }}>
                      <Package size={20} style={{ color: themeColors.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base" style={{ color: themeColors.text }}>
                        {item.asset.name}
                      </h3>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                        {item.asset.assetId} • {item.asset.category}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.currentlyWithMe ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${themeColors.success}20`, color: themeColors.success }}>
                        <CheckCircle size={14} />
                        WITH ME
                      </span>
                    ) : item.transferredTo ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${themeColors.warning}20`, color: themeColors.warning }}>
                        <ArrowRight size={14} />
                        TRANSFERRED
                      </span>
                    ) : assignment.isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${themeColors.info}20`, color: themeColors.info }}>
                        <TrendingUp size={14} />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${themeColors.textSecondary}15`, color: themeColors.textSecondary }}>
                        CLOSED
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Assigned By */}
                  <div className="flex items-start gap-2">
                    <User size={16} className="mt-0.5" style={{ color: themeColors.primary }} />
                    <div>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>Assigned By</p>
                      <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                        {formatName(assignment.assignedBy?.name)}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Date */}
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="mt-0.5" style={{ color: themeColors.primary }} />
                    <div>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>Assigned Date</p>
                      <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Days Used */}
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="mt-0.5" style={{ color: themeColors.primary }} />
                    <div>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>Days Used</p>
                      <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                        {assignment.daysUsed} days
                      </p>
                    </div>
                  </div>

                  {/* Return Date */}
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="mt-0.5" style={{ color: themeColors.primary }} />
                    <div>
                      <p className="text-xs" style={{ color: themeColors.textSecondary }}>Return Date</p>
                      <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                        {assignment.returnDate
                          ? new Date(assignment.returnDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transfer Info */}
                {item.transferredTo?.employee?.name && (
                  <div className="pt-4 border-t" style={{ borderColor: themeColors.border }}>
                    <div className="flex items-center gap-2">
                      <ArrowRight size={16} style={{ color: themeColors.warning }} />
                      <span className="text-xs" style={{ color: themeColors.textSecondary }}>Transferred to:</span>
                      <span className="text-sm font-semibold" style={{ color: themeColors.warning }}>
                        {formatName(item.transferredTo.employee.name)}
                      </span>
                      {item.transferredTo.transferDate && (
                        <span className="text-xs" style={{ color: themeColors.textSecondary }}>
                          on {new Date(item.transferredTo.transferDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default TransferHistory;
