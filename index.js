const express = require("express");
const cors = require("cors");
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} = require("firebase-admin/firestore");
require("dotenv").config();

const serviceAccount = require("./realtime-task-manage-firebase-adminsdk-qk8y4-31b2c1c757.json");
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());

// database connection
const taskCollection = db.collection("tasks");

// get tasks
app.get("/tasks", async (req, res) => {
  const userMail = req.query.email;
  const query = taskCollection.where("email", "==", userMail);
  const result = await query.get();
  let resultArray = [];
  result.forEach((doc) => {
    resultArray.push({ id: doc.id, ...doc.data() });
  });
  res.send(resultArray);
});

// assign tasks
// get tasks
app.get("/assign-tasks", async (req, res) => {
  const userMail = req.query.email;
  const query = db
    .collection("assign-tasks")
    .where("assign_email", "==", userMail);
  const result = await query.get();
  let resultArray = [];

  result.forEach((doc) => {
    resultArray.push({...doc.data()});
  });
  
  res.send(resultArray);
  // let assignTasks;
  // if (!resultArray && resultArray.length > 0) {
  //   assignTasks = await taskCollection.where("id", "in", resultArray).get();
  // }

  // let assignTaskArray = [];
  // if (assignTasks) {
  //   assignTasks.forEach((doc) => {
  //     resultArray.push({ id: doc.id, ...doc.data() });
  //   });
  // }
});

// filter tasks
app.get("/filtered-tasks", async (req, res) => {
  const userMail = req.query.email;
  const statusFilter = req.query.status;
  const dateFilter = req.query.date;

  let query;
  if (statusFilter && dateFilter) {
    query = taskCollection
      .where("email", "==", userMail)
      .where("status", "==", statusFilter)
      .where("task_deadline", "==", dateFilter);
  } else if (statusFilter && !dateFilter) {
    query = taskCollection
      .where("email", "==", userMail)
      .where("status", "==", statusFilter);
  } else if (!statusFilter && dateFilter) {
    query = taskCollection
      .where("email", "==", userMail)
      .where("task_deadline", "==", dateFilter);
  } else {
    query = taskCollection.where("email", "==", userMail);
  }
  const result = await query.get();
  let resultArray = [];
  result.forEach((doc) => {
    resultArray.push({ id: doc.id, ...doc.data() });
  });
  res.send(resultArray);
});

// create tasks
app.post("/tasks", async (req, res) => {
  const taskId = "task" + Date.now();
  const taskRef = taskCollection.doc(taskId);
  const newTask = req.body;
  const result = await taskRef.set(newTask);
  res.send(result);
});

// assign tasks
app.post("/assign-tasks", async (req, res) => {
  const assignTaskId = "task" + Date.now();
  const taskRef = db.collection("assign-tasks").doc(assignTaskId);
  const newAssignTask = req.body;
  const result = await taskRef.set(newAssignTask);
  res.send(result);
});

// update a task
app.patch("/tasks/:taskId", async (req, res) => {
  
  const taskId = req.params.taskId;
  const taskRef = taskCollection.doc(taskId);
  const doc = await taskRef.get();
  const data = doc.data();

  const updatedTask = { ...data, ...req.body };
  
  const result = await taskRef.set(updatedTask);
  res.send(result);
});

// delete a task
app.delete("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const result = await taskCollection.doc(taskId).delete();
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("task management server is running");
});

app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
