# Study Planner — Solidity DApp

**Contract Address:** `0xd247ED457d6efee39091a959361f49e70C23bF21`  
Explorer: [Flare Explorer](https://coston2-explorer.flare.network/address/0xd247ED457d6efee39091a959361f49e70C23bF21)
<img width="1726" height="792" alt="image" src="https://github.com/user-attachments/assets/51e37ea0-becd-4c5f-b9b6-4dca8fb36b13" />


---

## 📘 Project Description

The **Study Planner** is a lightweight decentralized application (DApp) that allows users to manage personal study tasks on-chain. Each wallet address maintains its own isolated task list, empowering learners to:

- Add study tasks with optional due dates
- Mark specific tasks as completed
- Delete tasks they no longer need
- Retrieve and review their full task list at any time

The smart contract stores task metadata (ID, title, due date, completion flag) per user, with the frontend interacting through `viem` and `wagmi` for seamless transaction management.

This project is designed for students, blockchain learners, and developers seeking a simple, practical example of user-specific state management in Solidity with a React + wagmi frontend.

---

## ⭐ Features

- **Per-wallet task lists**: Each connected wallet address manages its own tasks; no cross-user interference.
- **Add tasks**: Quickly add study tasks with a string title and optional due date (stored as Unix seconds).
- **Mark tasks completed**: Easily mark tasks as completed.
- **Delete tasks**: Remove tasks no longer needed.
- **View tasks**: Retrieve your tasks anytime.
- **Frontend UX**: Wallet connection gating, clear loading and transaction states, and friendly error handling.
- **Lightweight & gas-efficient**: Simple, clear logic that’s easy to understand and deploy.
- **Beginner-friendly**: Designed to be simple for developers learning Solidity and blockchain integration.

---

## How It Solves

### The Problem
Students and learners often manage their tasks across multiple apps, which might not be portable or tamper-evident. A decentralized task manager addresses these issues by ensuring:

- **User-owned data**: Tasks are tied to the wallet address.
- **Immutable records**: Actions like task added/completed/deleted are recorded on-chain.
- **Learning Solidity**: Helps users understand core concepts like structs, mappings, and arrays in the context of user-specific data.

### The Solution
This Study Planner uses a contract mapping keyed by address to store user tasks. The frontend communicates with the contract using `wagmi` and `viem`:

- **Read**: Efficient view functions (`getMyTasks()` and `getTaskCount()`) to retrieve user tasks.
- **Write**: Functions like `addTask()`, `completeTask()`, and `deleteTask()` to update tasks.
- **Events**: The contract emits task-related events (e.g., TaskAdded, TaskCompleted) for better transparency and easier indexing.

---

## 📦 Smart Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Study Planner — Task Management for Students
/// @notice Each user can add, complete, and delete tasks
contract StudyPlanner {

    struct Task {
        string name;
        bool completed;
    }

    mapping(address => Task[]) private userTasks;

    /// @notice Add a new task to the user's list
    /// @param _name Task description
    function addTask(string calldata _name) external {
        require(bytes(_name).length > 0, "Task name cannot be empty");
        userTasks[msg.sender].push(Task({ name: _name, completed: false }));
    }

    /// @notice Mark a task as completed
    /// @param taskIndex Index of the task in the list
    function completeTask(uint256 taskIndex) external {
        require(taskIndex < userTasks[msg.sender].length, "Invalid task index");
        userTasks[msg.sender][taskIndex].completed = true;
    }

    /// @notice Get all tasks for the calling user
    /// @return Array of Task structs
    function getMyTasks() external view returns (Task[] memory) {
        return userTasks[msg.sender];
    }

    /// @notice Get the number of tasks the user has added
    function getTaskCount() external view returns (uint256) {
        return userTasks[msg.sender].length;
    }
}
