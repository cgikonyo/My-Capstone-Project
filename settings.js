// Simple settings form
const form = document.createElement('form');
form.innerHTML = `
  <div>
    <label>Username</label>
    <input type="text" name="username" />
  </div>
  <div>
    <label>Email</label>
    <input type="email" name="email" />
  </div>
  <div>
    <label>Theme</label>
    <select name="theme">
      <option>light</option>
      <option>dark</option>
    </select>
  </div>
  <button type="submit">Save Settings</button>
`;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  console.log(Object.fromEntries(data));
  alert('Settings saved!');
});

export default form;
