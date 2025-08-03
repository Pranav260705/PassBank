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

  const [form, setform] = useState({
    id: "",
    site: "",
    username: "",
    password: "",
  });
  const getData = async () => {
    let req = await fetch("http://localhost:3000/api/logins", {
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

  const savePassword = async () => {
    const entry = form.id ? form : { ...form, id: uuidv4() };

    // Update UI
    setloginData([...loginData.filter((e) => e.id !== entry.id), entry]);

    if (form.id) {
      // Update existing
      await fetch(`http://localhost:3000/api/logins/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(entry),
      });
    } else {
      // Insert new
      await fetch("http://localhost:3000/api/logins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify([entry]),
      });
    }

    setform({ site: "", username: "", password: "" }); // Clear form
  };

  const deletePassword = async (index) => {
    const item = loginData[index];

    // Delete from server
    await fetch(`http://localhost:3000/api/logins/${item.id}`, {
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
      site: item.site,
      username: item.username,
      password: item.password,
      id: item.id, // retain original id
    });

    deletePassword(index); // then re-add on save
  };

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
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
            type="text"
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
        </div>
        {!loginData.length ? (
          <h2 className="text-center py-3 text-white">No Saved Passwords</h2>
        ) : (
          <div className="passwords">
            <h2 className="text-white font-bold text-xl py-3">
              Your Passwords
            </h2>
            <table className="table-auto w-full rounded-md overflow-hidden">
              <thead className=" bg-blue-800 text-white">
                <tr>
                  <th>Site</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-blue-900/10 text-white ">
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
        )}
      </div>
    </>
  );
};

export default Manager;
