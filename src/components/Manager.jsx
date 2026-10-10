import React, { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const LORDICON_ADD = import.meta.env.VITE_LORDICON_ADD;
const LORDICON_COPY = import.meta.env.VITE_LORDICON_COPY;
const LORDICON_DELETE = import.meta.env.VITE_LORDICON_DELETE;
const LORDICON_EDIT = import.meta.env.VITE_LORDICON_EDIT;

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [form, setform] = useState({
    id: "",
    site: "",
    username: "",
    password: "",
  });
  const getData = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    let req = await fetch(`${API_URL}/api/logins`, {
      credentials: 'include'
    });
    let data = await req.json();
    if (data) {
      setloginData(data);
    }
  };

  const [loginData, setloginData] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const copyText = (text) => {
    toast.success("Copied to Clipboard!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
  };

  const showPassword = () => {
    if (ref.current.src.includes("eye.png")) {
      passwordRef.current.type = "text";
      ref.current.src = "eyeCross.png";
    } else {
      passwordRef.current.type = "password";
      ref.current.src = "eye.png";
    }
  };

  function isValidURL(input) {
    if (!input || typeof input !== "string") return false;

    try {
      // Add scheme if missing
      const url = new URL(
        /^https?:\/\//i.test(input) ? input : "http://" + input
      );

      // Ensure it has at least a domain + TLD
      return (
        !!url.hostname &&
        url.hostname.includes(".") &&
        url.hostname.split(".").every((part) => part.length > 0)
      );
    } catch {
      return false;
    }
  }


const savePassword = async () => {
  if (!form.site || !form.username || !form.password) {
    toast.error("Please fill all the fields!");
    return;
  }

  if (!isValidURL(form.site)) {
    toast.error("Please enter a valid URL!");
    return;
  }

  if (
    loginData.some(
      (e) => e.site === form.site && e.id !== form.id
    )
  ) {
    toast.error("This site already exists!");
    return;
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  try {
    let strength;

    // Generated password: trust the generator and skip strength API.
    if (passwordGenerated) {
      strength = "Strong";
    } else {
      // Manually entered or modified password: check through API.
      const strengthRes = await fetch(`${API_URL}/api/passwords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: form.password }),
      });

      if (!strengthRes.ok) {
        throw new Error("Failed to check password strength");
      }

      const strengthData = await strengthRes.json();
      strength = strengthData.strength;
    }

    const entry = {
      ...form,
      id: form.id || uuidv4(),
      strength,
    };

    let response;

    if (form.id) {
      // Update existing login without deleting it first.
      response = await fetch(`${API_URL}/api/logins/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(entry),
      });
    } else {
      // Create a new login.
      response = await fetch(`${API_URL}/api/logins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify([entry]),
      });
    }

    if (!response.ok) {
      throw new Error("Failed to save password");
    }

    // Keep the UI in sync with the saved entry.
    setloginData((prev) => {
      const exists = prev.some((item) => item.id === entry.id);

      return exists
        ? prev.map((item) =>
            item.id === entry.id ? entry : item
          )
        : [...prev, entry];
    });

    setform({
      id: "",
      site: "",
      username: "",
      password: "",
    });

    setPasswordGenerated(false);
    toast.success("Password saved successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Unable to save password. Please try again.");
  }
};


  const deletePassword = async (index) => {
    const item = loginData[index];

    // Delete from server
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    await fetch(`${API_URL}/api/logins/${item.id}`, {
      method: "DELETE",
      credentials: 'include',
    });

    // Update local state
    const newData = [...loginData];
    newData.splice(index, 1);
    setloginData(newData);
  };

 
const editPassword = (index) => {
  const item = loginData[index];

  setform({
    id: item.id,
    site: item.site,
    username: item.username,
    password: item.password,
    strength: item.strength,
  });

  // Existing passwords must be checked if they are saved again,
  // unless the user generates a replacement.
  setPasswordGenerated(false);
};


  
const handleChange = (e) => {
  const { name, value } = e.target;

  setform((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "password") {
    setPasswordGenerated(false);
  }
};


  
const generatePassword = async () => {
  if (!form.site || !form.username) {
    toast.error("Please fill all the fields!");
    return;
  }

  if (!isValidURL(form.site)) {
    toast.error("Please enter a valid URL!");
    return;
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${API_URL}/generatePassword`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to generate password");
    }

    const data = await res.json();

    setform((prev) => ({
      ...prev,
      password: data.password,
      strength: "Strong",
    }));

    setPasswordGenerated(true);
  } catch (error) {
    console.error(error);
    toast.error("Error generating password. Please try again later!");
  }
};

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
      <div className=" mycontainer">
        <h1 className="text-4xl text-center font-bold">
          <span className="text-blue-500"> &lt;</span>
          <span className="text-white">Pass</span>
          <span className="text-blue-500">Bank/&gt;</span>
        </h1>
        <p className="text-white text text-center text-lg">
          Secure password manager
        </p>
        <div className="text-white flex flex-col p-4 gap-8 items-center">
          <input
            className="bg-slate-800 rounded-full border border-blue-500 w-full px-4 py-1"
            onChange={handleChange}
            type="url"
            value={form.site}
            name="site"
            id=""
            placeholder="Enter website URL"
          />
          <div className="flex w-full gap-8">
            <input
              className="bg-slate-800 rounded-full border border-blue-500 w-full px-4 py-1"
              onChange={handleChange}
              type="text"
              value={form.username}
              name="username"
              id=""
              placeholder="Enter username"
            />
            <div className="relative">
              <input
                ref={passwordRef}
                className="bg-slate-800 rounded-full border border-blue-500 w-full px-4 py-1"
                onChange={handleChange}
                type="password"
                value={form.password}
                name="password"
                id=""
                placeholder="Enter password"
              />
              <span
                className="absolute right-[3px] top-[4px] rounded-full w-fit cursor-pointer"
                onClick={showPassword}
              >
                <img
                  ref={ref}
                  className="p-1 bg-slate-800 rounded-full"
                  width={26}
                  src="eye.png"
                  alt=""
                />
              </span>
            </div>
          </div>
         <div className="flex gap-4">
           <button
            className="flex justify-center gap-2 items-center bg-blue-500 px-3 py-3 rounded-full w-fit hover:bg-blue-300 cursor-pointer"
            onClick={savePassword}
          >
            <lord-icon
              src={LORDICON_ADD}
              colors="primary:#ffffff"
              trigger="hover"
            ></lord-icon>
            Add Login
          </button>
          <button
            className="flex justify-center gap-2 items-center bg-green-600 px-3 py-3 rounded-full w-fit hover:bg-green-400 cursor-pointer"
            onClick={generatePassword}
          >
            <lord-icon
              src={LORDICON_ADD}
              colors="primary:#ffffff"
              trigger="hover"
            ></lord-icon>
            Generate Password
          </button>
         </div>
        </div>
        {!loginData.length ? (
          <h2 className="text-center py-3 text-white">No Saved Passwords</h2>
        ) : (
          <div className="passwords">
            <h2 className="text-white font-bold text-xl py-3">
              Your Passwords
            </h2>
            
            <div className="max-h-90 rounded-md no-scrollbar overflow-y-auto">
              <table className="table-auto w-full rounded-md">
                <thead className=" bg-blue-800 text-white sticky top-0  z-10">
                  <tr>
                    <th>Site</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Strength</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-900/10 text-white">
                  {loginData.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="py-2 text-center ">
                          <div className="flex items-center justify-center">
                            <a href={item.site}>{item.site}</a>
                            <div
                              className="loridconcpy size-7 cursor-pointer"
                              onClick={() => {
                                copyText(item.site);
                              }}
                            >
                              <lord-icon
                                className="edit"
                                src={LORDICON_COPY}
                                trigger="hover"
                                colors="primary:#ffffff,secondary:#ffffff"
                              ></lord-icon>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-center ">
                          <div className="flex items-center justify-center">
                            <a href={item.site}>{item.username}</a>
                            <div
                              className="loridconcpy size-7 cursor-pointer"
                              onClick={() => {
                                copyText(item.username);
                              }}
                            >
                              <lord-icon
                                className="edit"
                                src={LORDICON_COPY}
                                trigger="hover"
                                colors="primary:#ffffff,secondary:#ffffff"
                              ></lord-icon>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-center ">
                          <div className="flex items-center justify-center">
                            <a href={item.site}>{item.password}</a>
                            <div
                              className="loridconcpy size-7 cursor-pointer"
                              onClick={() => {
                                copyText(item.password);
                              }}
                            >
                              <lord-icon
                                className="edit"
                                src={LORDICON_COPY}
                                trigger="hover"
                                colors="primary:#ffffff,secondary:#ffffff"
                              ></lord-icon>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <div className="flex items-center justify-center">
                            <a href={item.site}>{item.strength}</a>
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div>
                              <button
                                className="cursor-pointer"
                                onClick={() => {
                                  deletePassword(index);
                                }}
                              >
                                <lord-icon
                                  className="delete"
                                  src={LORDICON_DELETE}
                                  trigger="hover"
                                  colors="primary:#ffffff"
                                ></lord-icon>
                              </button>
                            </div>
                            <div>
                              <button
                                className="cursor-pointer"
                                onClick={() => {
                                  editPassword(index);
                                }}
                              >
                                <lord-icon
                                  className="editIcon"
                                  src={LORDICON_EDIT}
                                  trigger="hover"
                                  colors="primary:#ffffff,secondary:#ffffff"
                                ></lord-icon>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Manager;
