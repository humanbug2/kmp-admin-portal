"use client";
import { ChangeEvent, useState } from "react";
import { S3 } from "aws-sdk";
import { useQuery } from "react-query";
import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
  Snackbar,
} from "@mui/material";
import LoadingSpinner from "./LoadingSpinner";

const UploadWSubmit = () => {
  const s3 = new S3({
    region: "us-east-1",
    credentials: {
      accessKeyId: "AKIAXFG5KVPTVPQMMHG7",
      secretAccessKey: "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",
    },
  });
  const [selectedFile, setSelectedFile] = useState({ name: "" });
  const [selectedUsers, setSelectedUsers] = useState([] as string[]);
  const [openS3Message, setOpenS3Message] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [submitSpinner, setSubmitSpinner] = useState(false);
  const [taskSpinner, setTaskSpinner] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleOpenS3Message = () => {
    setOpenS3Message(true);
  };
  const handleOpenError = () => {
    setOpenError(true);
  };
  const handleOpenSuccess = () => {
    setOpenSuccess(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleCloseS3Message = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenS3Message(false);
  };
  const handleCloseError = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenError(false);
  };
  const handleCloseSuccess = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSuccess(false);
  };
  const apiGatewayUrl = "https://kmp-render.onrender.com/";

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let file: File | undefined;
    if (e.target.files) file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    setSubmitSpinner(true);
    const params = {
      Bucket: "kmp-files",
      Key: selectedFile?.name,
      Body: selectedFile,
    };
    try {
      const response = await s3.upload(params).promise();
      handleOpenS3Message();
      await handleSubmit();
    } catch (error) {
      setSubmitSpinner(false);
      handleOpenError();
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = async () => {
    const formData = {
      table: selectedFile?.name,
    };
    const apiResponse = await fetch(apiGatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from Render:", data);
        data.statusCode === 200 ? handleOpen() : handleOpenError();
        setSubmitSpinner(false);
      })
      .catch((error) => {
        setSubmitSpinner(false);
        handleOpenError();
        console.error("Error:", error);
      });
  };

  const fetchUserData = async () => {
    try {
      const userList = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/userData`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      const userData = await userList.json();
      // Returns Task list in the form of object
      return userData;
    } catch (e) {
      console.error(e);
    }
  };

  const updateTaskData = async () => {
    setTaskSpinner(true);
    try {
      let formData = {
        file: selectedFile.name,
        users: selectedUsers,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/taskData`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res, "response");
      setTaskSpinner(false);
      res.status === 200 ? handleOpenSuccess() : handleOpenError();
    } catch (e) {
      setTaskSpinner(false);
      handleOpenError();
      console.error(e);
    }
  };

  const { data: userData, isLoading: userLoading } = useQuery(
    ["userList"],
    () => fetchUserData()
  );

  const handleUserSelect = (userName: string) => {
    if (selectedUsers.includes(userName)) {
      setSelectedUsers(selectedUsers.filter((name) => name !== userName));
    } else {
      setSelectedUsers([...selectedUsers, userName]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <label className="block text-xl font-bold mb-2">Select a CSV File:</label>
      <div className="rounded-md shadow-sm cursor-pointer">
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block cursor-pointer w-full py-2 px-3 border border-white rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300 focus:outline-none"
        />
      </div>
      <div className="my-2 text-lg text-red-900 rounded-lg border-2 border-red-600 p-4">
        <span>
          Please ensure your file abides by the following rules before
          submitting:
        </span>
        <li>File format should be .csv</li>
        <li>
          File Name and Column Names should be in alphanumeric format, or can
          have a _, no other special characters supported.
        </li>
        <li>
          File should have 2 columns: &apos;id&apos; and &apos;allocation&apos;
        </li>
      </div>
      {submitSpinner ? (
        <LoadingSpinner size={30} />
      ) : (
        <button
          className="bg-gray-500 rounded-xl text-lg p-2 px-4 my-2"
          onClick={() => handleUpload()}
        >
          Submit
        </button>
      )}

      {userLoading || userData === "null" || typeof userData === "undefined" ? (
        <CircularProgress />
      ) : (
        <>
          <Typography className="text-lg">
            Select Users for your Task
          </Typography>
          <List>
            {Object.entries(userData).map(
              ([userId, userDataEntry]: [string, any]) => (
                <ListItem key={userId}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedUsers.includes(userDataEntry.name)}
                        onChange={() => handleUserSelect(userDataEntry.name)}
                      />
                    }
                    label={
                      <ListItemText
                        primary={userDataEntry.name}
                        secondary={userDataEntry.email}
                      />
                    }
                  />
                </ListItem>
              )
            )}
          </List>
          {taskSpinner ? (
            <LoadingSpinner size={30} />
          ) : (
            <button
              className="bg-gray-500 rounded-xl text-lg p-2 px-4 my-2"
              onClick={() => updateTaskData()}
            >
              Add Users
            </button>
          )}
        </>
      )}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="File Successfully Uploaded in DB"
      />
      <Snackbar
        open={openS3Message}
        autoHideDuration={6000}
        onClose={handleCloseS3Message}
        message="File added successfully in S3 Bucket. Please wait as we upload all your data in our database."
      />
      <Snackbar
        open={openError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        message="Error !!! Check Logs"
      />
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        message="Users added successfully"
      />
    </div>
  );
};

export default UploadWSubmit;
