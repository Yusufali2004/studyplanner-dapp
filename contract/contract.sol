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
