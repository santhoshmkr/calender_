import React, { useState, useEffect } from "react";
import clsx from "clsx";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay as getDayOfWeek,
  isToday,
  startOfMonth,
} from "date-fns";
import axios from "axios";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Calender() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [clickedState, setClickedState] = useState({});
  const [event, setEvent] = useState(false);
  const currentDate = new Date();
  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = endOfMonth(selectedDate);
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTaskStartTime, setNewTaskStartTime] = useState("00:00");
  const [newTaskEndTime, setNewTaskEndTime] = useState("00:00");

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `https://calender-lypl.onrender.com/plan?date=${
          selectedDate.toISOString().split("T")[0]
        }`
      );
      const tasksData = response.data;
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async () => {
    // Check if task name, start time, and end time are provided
    if (!newTask || !newTaskStartTime || !newTaskEndTime) {
        alert("Please provide task name, start time, and end time");
        return;
    }

    // Validate start and end time format
    const timeRegex = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/;
    if (!timeRegex.test(newTaskStartTime) || !timeRegex.test(newTaskEndTime)) {
        alert("Please provide valid start and end time in HH:MM format");
        return;
    }

    // Convert start and end time to Date objects for comparison
    const startTime = new Date(`2000-01-01T${newTaskStartTime}:00`);
    const endTime = new Date(`2000-01-01T${newTaskEndTime}:00`);

    // Check if start time is before end time
    if (startTime >= endTime) {
        alert("End time must be after start time");
        return;
    }

    // Check if the time difference between start and end time is more than 2 hours
    const timeDifference = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
    if (timeDifference < 2) {
        alert("The task duration must be at least 2 hours");
        return;
    }

    // If all validations pass, proceed with adding the task
    try {
        await axios.post("https://calender-lypl.onrender.com/plan", {
            date: selectedDay.toISOString().split("T")[0],
            todo: newTask,
            startTime: newTaskStartTime,
            endTime: newTaskEndTime,
        });

        await fetchTasks();
        resetForm();
    } catch (error) {
        handleRequestError("Error adding task:", error);
    }
};



  

  const resetForm = () => {
    setNewTask("");
    setNewTaskStartTime("00:00");
    setNewTaskEndTime("00:00");
    setEvent(false);
  };

  const handleMonthChange = (e) => {
    const monthIndex = e.target.value;
    setSelectedDate(new Date(selectedDate.getFullYear(), monthIndex));
  };

  const handleDate = (day) => {
    setSelectedDay(day);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`https://calender-lypl.onrender.com/plan/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCompleteTask = async (taskId, taskIndex) => {
    try {
      await axios.patch(`https://calender-lypl.onrender.com/plan/${taskId}`, {
        completed: true,
      });

      await fetchTasks();

      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        updatedTasks[taskIndex].completed = true;
        return updatedTasks;
      });
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  const getCurrentYear = () => {
    return selectedDate.getFullYear();
  };
  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedDate(new Date(year, selectedDate.getMonth()));
  };
  const startingDayIndex = getDayOfWeek(firstDayOfMonth);

  return (
    <div className="container mx-auto p-4 grid lg:grid-flow-col md:grid-flow-col sm:grid-flow-row gap-4">
      <div className="w-full">
        <div className="grid mb-2 gap-3 grid-flow-col justify-around ">
          <h2 className="text-center text-2xl font-extrabold grid place-items-center">
            Calendar
          </h2>
          <div>
            <select
              name="month"
              value={selectedDate.getMonth()}
              onChange={handleMonthChange}
              className="border-orange rounded-full border-2 p-2 text-orange font-bold"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name=""
              id=""
              value={getCurrentYear()}
              onChange={handleYearChange}
              className="border-orange rounded-full border-2 p-2 text-orange font-bold"
            >
              {Array.from(
                { length: 10 },
                (_, index) => selectedDate.getFullYear() - 5 + index
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="">
            <button
              className="border-2 w-max border-orange rounded-full p-2 font-medium bg-orange text-white hover:bg-white hover:text-orange"
              onClick={() => setEvent(true)}
            >
              +add events
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-lg font-bold text-center">
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="rounded-2xl border-2" />
          ))}
          {daysInMonth.map((day, index) => {
            const isTodayDate = isToday(day);
            const dayClassName = `p-4 rounded-2xl border-2 hover:bg-white text-lg font-bold ${
              isTodayDate
                ? "bg-orange text-white hover:bg-blue hover:text-orange"
                : "bg-gray-100 text-black"
            }`;

            return (
              <div
                key={index}
                className={dayClassName}
                onClick={() => handleDate(day)}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-1/2">
        <div className="">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDay ? selectedDay.toDateString() : ""}
          </h2>

          <div className="grid grid-cols-3 gap-3 m-2">
            {tasks
              .filter(
                (task) =>
                  task.date ===
                  (selectedDay ? selectedDay.toISOString().split("T")[0] : null)
              )
              .map((task, index) => (
                <div
                  key={index}
                  className={`bg-orange shadow-md rounded-lg p-2 m-2 grid w-max  ${
                    task.completed ? "bg-green-500" : ""
                  }`}
                >
                  <div className="task-details flex flex-col">
                    <span className="">
                      {selectedDay ? selectedDay.toDateString() : null}
                    </span>
                    <span className="task-text">{task.todo}</span>
                    {task.startTime && task.endTime && (
                      <span className="time-range">
                        {task.startTime} - {task.endTime}
                      </span>
                    )}
                    <div className="">
                      <button
                        className="delete-button ml-2"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        X
                      </button>
                      {!task.completed && (
                        <button
                          className="complete-button ml-2"
                          onClick={() => handleCompleteTask(task._id, index)}
                        >
                          &#10004;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="w-max">
          {event && (
            <div className=" ">
              <input
                type="text"
                placeholder="Add a new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="border border-gray-300 px-4 py-2 mx-2  rounded-lg mr-2"
              />
              <input
                type="time"
                value={newTaskStartTime}
                onChange={(e) => setNewTaskStartTime(e.target.value)}
                id=""
                className="border-2 mx-2 p-2 rounded-md"
              />
              <input
                type="time"
                value={newTaskEndTime}
                onChange={(e) => setNewTaskEndTime(e.target.value)}
                id=""
                className="border-2 mx-2 p-2 rounded-md "
              />
              <button className="border-2 mx-2 p-2 rounded-md font-bold " onClick={handleAddTask}>
                submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calender;
