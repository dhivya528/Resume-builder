import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./App.css";

const API = "http://localhost:8080";

function App() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    skills: "",
    experience: 0
  });

  const [resumes, setResumes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "experience"
          ? parseInt(e.target.value) || 0
          : e.target.value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.skills.trim()) {
      newErrors.skills = "Skills are required";
    }

    if (form.experience < 0) {
      newErrors.experience = "Experience must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/resume`);
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      if (editId) {
        await axios.put(`${API}/resume/${editId}`, form);
        alert("Updated successfully");
      } else {
        await axios.post(`${API}/resume`, form);
        alert("Saved successfully");
      }

      setForm({ name: "", email: "", skills: "", experience: 0 });
      setEditId(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  const deleteResume = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        await axios.delete(`${API}/resume/${id}`);
        loadData();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const editResume = (r) => {
    setForm(r);
    setEditId(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadResume = (r) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("RESUME", 80, 15);

    doc.setFontSize(12);
    doc.text(`Name: ${r.name}`, 10, 30);
    doc.text(`Email: ${r.email}`, 10, 40);
    doc.text(`Skills: ${r.skills}`, 10, 50);
    doc.text(`Experience: ${r.experience} year${r.experience > 1 ? "s" : ""}`, 10, 60);

    doc.save(`${r.name}_resume.pdf`);
  };

  const filteredResumes = resumes.filter((r) =>
    (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.skills || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">

      <h2>Resume Builder</h2>

      <form onSubmit={handleSubmit}>
        
        <input name="name" value={form.name} placeholder="Name" onChange={handleChange} />
        {errors.name && <p>{errors.name}</p>}

        <input name="email" value={form.email} placeholder="Email" onChange={handleChange} />
        {errors.email && <p>{errors.email}</p>}

        <input name="skills" value={form.skills} placeholder="Skills" onChange={handleChange} />
        {errors.skills && <p>{errors.skills}</p>}

        <input
          name="experience"
          type="number"
          value={form.experience}
          placeholder="Experience"
          onChange={handleChange}
        />
        {errors.experience && <p>{errors.experience}</p>}

        <button type="submit">
          {loading ? "Processing..." : editId ? "Update" : "Submit"}
        </button>
      </form>

      <input
        placeholder="Search by name or skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Experience</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredResumes.length === 0 ? (
            <tr>
              <td colSpan="6">No resumes found</td>
            </tr>
          ) : (
            filteredResumes.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.skills}</td>
                <td>{r.experience} year{r.experience > 1 ? "s" : ""}</td>
                <td>
                  <button onClick={() => editResume(r)}>Edit</button>
                  <button onClick={() => deleteResume(r.id)}>Delete</button>
                  <button onClick={() => downloadResume(r)}>PDF</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  );
}

export default App;