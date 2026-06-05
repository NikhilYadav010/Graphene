// Uses Node 20+ native fetch — no external HTTP libraries needed
async function run() {
  try {
    let res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test2@example.com', password: 'password123' })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const token = data.token;
    
    // get projects
    res = await fetch('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const projectId = data.data[0]._id;
    
    // create task
    res = await fetch(`http://localhost:5000/api/tasks/project/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Http Task',
        description: 'Desc',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeId: null
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('Task created successfully via HTTP:', data.data);
    
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

run();
