import React, { useState, useEffect } from "react";
import { saveContactsForUser, getContactsForUser } from "../../public/firebase/firestore";
import "../styling/Contacts.css"; 

const Contacts = () => {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const userContacts = await getContactsForUser();
      setContacts(userContacts);
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (contactName && contactPhone && contactEmail) {
      const newContact = { name: contactName, phone: contactPhone, email: contactEmail };
      const updatedContacts = [...contacts, newContact];

      await saveContactsForUser(updatedContacts);
      setContacts(updatedContacts);
      setContactName("");
      setContactPhone("");
      setContactEmail("");  
    }
  };

  const handleRemoveContact = async (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    await saveContactsForUser(updatedContacts);
    setContacts(updatedContacts);
  };

  return (
    <div className="contacts-wrapper">
      <h2 className="contacts-heading">Manage Emergency Contacts</h2>

      <div className="contact-form">
        <input
          type="text"
          placeholder="Contact Name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddContact} className="add-contact-btn">
          Add Contact
        </button>
      </div>

      <div className="contacts-list">
        <h3>Your Contacts:</h3>
        {contacts.length === 0 ? (
          <p className="no-contacts-text">No contacts added yet. Add some!</p>
        ) : (
          <ul>
            {contacts.map((contact, index) => (
              <li className="contact-item" key={index}>
                <span className="contact-info">
                  {contact.name} - {contact.phone} - {contact.email}
                </span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveContact(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Contacts;
