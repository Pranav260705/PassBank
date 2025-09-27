import React, { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import DocumentUpload from "./DocumentUpload";

const LORDICON_ADD = import.meta.env.VITE_LORDICON_ADD;
const LORDICON_COPY = import.meta.env.VITE_LORDICON_COPY;
const LORDICON_DELETE = import.meta.env.VITE_LORDICON_DELETE;
const LORDICON_EDIT = import.meta.env.VITE_LORDICON_EDIT;

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [activeTab, setActiveTab] = useState('passwords');

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
  const [isloading,setIsLoading]= useState(false);
  const [isGenerating,setIsGenerating]= useState(false);
  const [isGenerated,setIsGenerated]= useState(false);
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
    if (form.site == "" || form.username == "" || form.password == "") {
      toast.error("Please fill all the fields!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    } 
    if (!isValidURL(form.site)) {
      toast.error("Please enter a valid URL!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    if(loginData.filter(e => e.site === form.site && e.id !== form.id).length > 0) {
      toast.error("This site already exists!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      // return editPassword(loginData.findIndex(e => e.site === form.site && e.id !== form.id));
      return;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    setIsLoading(true);
    let strengthData = { strength: "strong" };
    if(!isGenerated){
    const strengthRes = await fetch(`${API_URL}/api/passwords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: form.password }),
      
      });
      strengthData = await strengthRes.json();
    }
    setIsGenerated(false);
    
    const entry = form.id ? form : { ...form, id: uuidv4(),strength:strengthData.strength };
    if (form.id) {
      // Update existing
      await fetch(`${API_URL}/api/logins/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(entry),
      });
    } else {
      // Insert new
      await fetch(`${API_URL}/api/logins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify([entry]),
      });
    }
    // Update UI
    setloginData([...loginData.filter((e) => e.id !== entry.id), entry]);
    setIsLoading(false);
    setform({ site: "", username: "", password: "" });
      // Clear form
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

  const generatePassword = async () => {
    setIsGenerating(true);
    setIsGenerated(true);
    if (form.site == "" || form.username == "") {
      toast.error("Please fill all the fields!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    } 
    if (!isValidURL(form.site)) {
      toast.error("Please enter a valid URL!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try{
   const res = await  fetch(`${API_URL}/generatePassword`, { method: "GET" })
      const data = await res.json();
        setform({...form, password: data.password});
        setIsGenerating(false);
    }catch(error){
      toast.error("Error generating passwoord. Please try again later!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
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
          Secure password manager & document storage
        </p>

         
        <div className="flex justify-center mb-8 py-5">
          <div className="bg-slate-800 rounded-full p-1 flex">
            <button
              onClick={() => setActiveTab('passwords')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'passwords'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Passwords
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'documents'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Documents
            </button>
          </div>
        </div>
        {/* Conditional content based on active tab */}
        {activeTab === 'passwords' && (
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
              {isloading? <p>Adding Login...</p> : <><lord-icon
                src={LORDICON_ADD}
                colors="primary:#ffffff"
                trigger="hover"
              ></lord-icon>
              <p>Add Login</p></>}
              
            </button>
            <button
              className="flex justify-center gap-2 items-center bg-green-600 px-3 py-3 rounded-full w-fit hover:bg-green-400 cursor-pointer"
              onClick={generatePassword}
            >
             {isGenerating? <p>Generating...</p> : <> <lord-icon
                src={LORDICON_ADD}
                colors="primary:#ffffff"
                trigger="hover"
              ></lord-icon>
              Generate Password
            </>}
            </button>
           </div>
          </div>
        )}
        {activeTab === 'passwords' && (
          <>
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
          </>
        )}

        {activeTab === 'documents' && (
          <div className="p-4">
            <DocumentUpload />
          </div>
        )}
      </div>
    </>
  );
};

export default Manager;
