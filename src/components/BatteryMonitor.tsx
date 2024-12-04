import React, { useState, useEffect } from "react";
import axios from "axios";

interface Device {
  id: number;
  device_id: string;
  battery_level: number;
  last_updated: string;
}

interface StatusIndicator {
  text: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

const BatteryMonitor: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0, // <= 20%
    low: 0, // 20-50%
    normal: 0, // > 50%
    full: 0, // 100%
  });

  const fetchDevices = async () => {
    try {
      const response = await axios.get<Device[]>(
        "https://battery-test.onrender.com/api/devices"
      );
      const data = response.data;
      setDevices(data);

      // 計算統計數據
      setStats({
        total: data.length,
        critical: data.filter((d) => d.battery_level <= 20).length,
        low: data.filter((d) => d.battery_level > 20 && d.battery_level <= 50)
          .length,
        normal: data.filter(
          (d) => d.battery_level > 50 && d.battery_level < 100
        ).length,
        full: data.filter((d) => d.battery_level === 100).length,
      });

      setError(null);
    } catch (err) {
      setError("無法連接到伺服器");
      console.error("Error:", err);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      await axios.delete(
        `https://battery-test.onrender.com/api/devices/${deviceId}`
      );
      fetchDevices();
    } catch (err) {
      setError("刪除失敗");
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 3600 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIndicator = (level: number): StatusIndicator => {
    if (level <= 20)
      return {
        text: "電量不足",
        color: "#ff4d4f",
        backgroundColor: "#fff2f0",
        borderColor: "#ffccc7",
      };
    if (level <= 50)
      return {
        text: "低電量",
        color: "#faad14",
        backgroundColor: "#fff7e6",
        borderColor: "#ffd591",
      };
    if (level === 100)
      return {
        text: "滿電",
        color: "#52c41a",
        backgroundColor: "#f6ffed",
        borderColor: "#b7eb8f",
      };
    return {
      text: "正常",
      color: "#1890ff",
      backgroundColor: "#e6f7ff",
      borderColor: "#91d5ff",
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
          平板電腦電量監控系統
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
          }}
        >
          <StatusCard
            title="總設備數"
            value={stats.total}
            color="#1890ff"
            backgroundColor="#e6f7ff"
          />
          <StatusCard
            title="電量不足"
            value={stats.critical}
            color="#ff4d4f"
            backgroundColor="#fff2f0"
          />
          <StatusCard
            title="低電量"
            value={stats.low}
            color="#faad14"
            backgroundColor="#fff7e6"
          />
          <StatusCard
            title="正常"
            value={stats.normal}
            color="#1890ff"
            backgroundColor="#e6f7ff"
          />
          <StatusCard
            title="滿電"
            value={stats.full}
            color="#52c41a"
            backgroundColor="#f6ffed"
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            marginBottom: "20px",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          alignContent: "start",
          padding: "4px",
        }}
      >
        {devices.map((device: Device) => {
          const status = getStatusIndicator(device.battery_level);
          const getBatteryColor = (level: number) => {
            if (level <= 20) return "#ff4d4f";
            if (level <= 50) return "#faad14";
            if (level === 100) return "#52c41a";
            return "#1890ff";
          };

          return (
            <div
              key={device.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px" }}>
                  平板 {device.device_id}
                </h3>
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    border: `1px solid ${status.borderColor}`,
                    backgroundColor: status.backgroundColor,
                    color: status.color,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: status.color,
                      boxShadow: `0 0 4px ${status.color}`,
                    }}
                  />
                  {status.text}
                </div>
              </div>

              <div
                style={{
                  height: "10px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "12px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: `${device.battery_level}%`,
                    height: "100%",
                    backgroundColor: getBatteryColor(device.battery_level),
                    transition: "all 0.3s ease",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: getBatteryColor(device.battery_level),
                  }}
                >
                  {device.battery_level}%
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(device.last_updated).toLocaleString()}
                  </span>
                  <button
                    onClick={() => deleteDevice(device.device_id)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#ff4d4f",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {devices.length === 0 && !error && (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          目前沒有已連接的平板電腦
        </div>
      )}
    </div>
  );
};

// 統計卡片元件
const StatusCard = ({
  title,
  value,
  color = "#1f2937",
  backgroundColor = "#f3f4f6",
}: {
  title: string;
  value: number;
  color?: string;
  backgroundColor?: string;
}) => (
  <div
    style={{
      padding: "16px",
      borderRadius: "8px",
      backgroundColor: backgroundColor,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        color: color,
        marginBottom: "4px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "14px",
        color: "#4b5563",
      }}
    >
      {title}
    </div>
  </div>
);

export default BatteryMonitor;
