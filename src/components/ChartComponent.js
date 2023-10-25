import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "../styles/style.css";
import { useDispatch, useSelector } from "react-redux";
import { addDataPoint } from "../utils/actions";
import { getMqttDataFromBackend } from "../services/apiService";
import { sendMqttData } from "../services/Socket";

function ChartComponent({ updateData, lines }) {
  const dispatch = useDispatch();
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);

  const chartData = useSelector((state) => state.chartData);
  useEffect(() => {
    const mqttData = {
      temperature: null,
      humidity: null,
      light: null,
    };
    sendMqttData((topic, value) => {
      console.log("socket được gọi");
      if (topic === "temperature" || topic === "humidity" || topic === "light") {
        mqttData[topic] = value;
        if (mqttData.temperature !== null && mqttData.humidity !== null && mqttData.light !== null) {
          const currentTimeLabel = getCurrentTimeLabel();
          updateData(mqttData.temperature, mqttData.humidity, mqttData.light);
          const newDataPoint = {
            time: currentTimeLabel,
            temperature: mqttData.temperature,
            humidity: mqttData.humidity,
            light: mqttData.light,
          };
          dispatch(addDataPoint(newDataPoint));
          mqttData.temperature = null;
          mqttData.humidity = null;
          mqttData.light = null;
        }
      }
    });
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 800) {
        setChartWidth(400);
      } else {
        setChartWidth(800);
      }

      if (window.innerWidth < 400) {
        setChartHeight(200);
      } else {
        setChartHeight(400);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getCurrentTimeLabel = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div id="chartComponent">
      <LineChart width={chartWidth} height={chartHeight} data={chartData} margin={{ right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveEnd" />
        <YAxis type="number" domain={[0, 100]} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} />
        <Tooltip />
        <Legend verticalAlign="top" />
        {lines.map(line => (
          <Line key={line.dataKey} {...line} />
        ))}
      </LineChart>
    </div>
  );
}

export default ChartComponent;