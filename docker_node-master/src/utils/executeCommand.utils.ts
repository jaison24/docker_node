import { exec } from "child_process";

// Utility to execute shell commands
export const executeCommand = (command: string): Promise<string> =>
    new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(stderr || error.message);
        }
        resolve(stdout.trim());
      });
    });