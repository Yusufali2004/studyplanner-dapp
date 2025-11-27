# studyplanner-dapp


# Beginner Study Planner – Solidity Smart Contract

A simple and beginner-friendly **Study Planner** smart contract built with Solidity.  
This project is perfect for learners who want to understand how to store user-specific data, update it, and retrieve it on the blockchain.

---

## 📘 Project Description

The **Beginner Study Planner** is a decentralized task manager that allows each user to:

- Add their own study tasks
- Mark tasks as completed
- Fetch their list of tasks
- Track how many tasks they have added

Every user has their **own isolated task list**—meaning no one can see or modify someone else’s tasks.

This project demonstrates core concepts such as:
- Structs  
- Mappings  
- Arrays  
- State modification  
- View functions  

---

## 🚀 What It Does

- Stores tasks for every user (based on their wallet address)
- Lets users add new tasks with a simple description
- Enables marking a task as "completed"
- Provides a way to retrieve all tasks at any time
- Counts how many tasks each user has added

It's a beginner-friendly example of how to build your first functional smart contract.

---

## ⭐ Features

- **User-specific task lists** – Each wallet gets its own independent data.
- **Add tasks** – Quickly add any study task you want to track.
- **Mark tasks as completed** – Update task status with a single function call.
- **View your tasks** – See all tasks you’ve added.
- **Lightweight & gas efficient** – Simple logic suitable for learning and deployment.
- **Beginner-friendly codebase** – Easy to read, understand, and extend.

---

## 🌐 Deployed Smart Contract

**Contract Address:** `0xd247ED457d6efee39091a959361f49e70C23bF21`  
**Block Explorer:** XXX

---

## 📦 Smart Contract Code

```solidity
//paste your code

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Beginner Study Planner
/// @notice Each user can add tasks and mark them as completed
contract StudyPlanner {

    // A simple task structure
    struct Task {
        string name;     // Name of the task
        bool completed;  // True if user completed it
    }

    // Each user (address) has their own list of tasks
    mapping(address => Task[]) private userTasks;

    /// @notice Add a new task to your study list
    /// @param _name The name/description of your task
    function addTask(string calldata _name) external {
        require(bytes(_name).length > 0, "Task name cannot be empty");

        userTasks[msg.sender].push(Task({
            name: _name,
            completed: false
        }));
    }

    /// @notice Mark one of your tasks as completed
    /// @param taskIndex The index (0,1,2...) of the task in your list
    function completeTask(uint256 taskIndex) external {
        require(taskIndex < userTasks[msg.sender].length, "Invalid task index");

        userTasks[msg.sender][taskIndex].completed = true;
    }

    /// @notice Get all your tasks
    /// @return Array of Task structs containing your tasks
    function getMyTasks() external view returns (Task[] memory) {
        return userTasks[msg.sender];
    }

    /// @notice Get how many tasks you have added
    function getTaskCount() external view returns (uint256) {
        return userTasks[msg.sender].length;
    }
}
