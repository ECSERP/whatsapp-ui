import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://wa.ecampusstreet.com");

function App() {
  const [qrCode, setQrCode] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [clientId, setClientId] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    socket.on("userId", (id) => {
      setClientId(id);
      axios.get(`https://wa.ecampusstreet.com/check-auth/${id}`).then((res) => {
        setIsAuthenticated(res.data.authenticated);
      });
    });

    socket.on("qrCode", setQrCode);
    socket.on("authenticated", setIsAuthenticated);
    socket.on("log", (log) => {
      setLogs((prevLogs) => [...prevLogs, log]);
      logRef.current?.scrollTo({
        top: logRef.current.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => {
      socket.off("qrCode");
      socket.off("authenticated");
      socket.off("log");
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post("https://wa.ecampusstreet.com/logout", {
        userId: clientId,
      });
      alert(response.data.message);
      setIsAuthenticated(false);
      setQrCode(null);
      setLogs([]);
      setMessage("");
    } catch (error) {
      alert("Logout failed.");
    }
  };

  const handleSendBulkMessages = async () => {
    try {
      await axios.post("https://wa.ecampusstreet.com/send-bulk-messages", {
        userId: clientId,
        message,
      });
      alert("Bulk messaging started.");
    } catch (error) {
      alert("Failed to start bulk messaging.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>WhatsApp Bulk Message Sender</h1>

      {!isAuthenticated ? (
        <div style={styles.qrContainer}>
          <h2>Scan QR Code</h2>
          {qrCode ? (
            <img src={qrCode} alt="QR Code" style={styles.qrCode} />
          ) : (
            <p>Waiting for QR code...</p>
          )}
        </div>
      ) : (
        <div style={styles.mainContent}>
          <textarea
            style={styles.textarea}
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div style={styles.buttonContainer}>
            <button onClick={handleSendBulkMessages} style={styles.button}>
              Send Bulk Messages
            </button>
            <button
              onClick={handleLogout}
              style={{ ...styles.button, ...styles.logout }}
            >
              Logout
            </button>
          </div>

          <h2 style={styles.logsHeading}>Logs</h2>
          <div style={styles.logContainer} ref={logRef}>
            {logs.map((log, index) => (
              <div key={index} style={styles.logItem}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "500px",
    margin: "auto",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    fontSize: "22px",
    color: "#333",
  },
  qrContainer: {
    textAlign: "center",
    padding: "20px",
  },
  qrCode: {
    width: "200px",
    height: "200px",
    marginTop: "10px",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textarea: {
    width: "90%",
    height: "80px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    fontSize: "14px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: "15px",
  },
  button: {
    flex: 1,
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    margin: "5px",
  },
  logout: {
    backgroundColor: "#dc3545",
  },
  logsHeading: {
    fontSize: "18px",
    marginTop: "10px",
    color: "#333",
  },
  logContainer: {
    width: "90%",
    height: "200px",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "5px",
    padding: "10px",
    border: "1px solid #ccc",
    textAlign: "left",
    fontSize: "12px",
    lineHeight: "1.4",
  },
  logItem: {
    borderBottom: "1px solid #ddd",
    padding: "5px 0",
  },
};

export default App;
