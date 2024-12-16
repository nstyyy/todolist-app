const userId = localStorage.getItem('userId');

// Vérification utilisateur connecté
if (!userId) {
  window.location.href = 'index.html';
}

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');

  // Ajoute le texte et la classe appropriée
  notification.textContent = message;
  notification.className = type === 'error' ? 'error' : ''; // Ajoute 'error' pour les erreurs
  notification.classList.remove('hidden');

  // Rend visible (avec transition CSS)
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10); // Petit délai pour déclencher l'animation

  // Cache après 3 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => notification.classList.add('hidden'), 500);
  }, 3000);
}

// Charger les tâches
async function loadTasks() {
  const response = await fetch(`/tasks?userId=${userId}`);
  const tasks = await response.json();

  document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.classList.add('task');
    taskEl.textContent = task.title;
    taskEl.draggable = true;
    taskEl.dataset.id = task.id;
    taskEl.dataset.title = task.title;
    taskEl.dataset.description = task.description;
    taskEl.dataset.created_at = task.created_at;
    taskEl.dataset.username = task.username;
    taskEl.dataset.status = task.status;

    taskEl.addEventListener('click', () => showTaskDetails(taskEl));

    taskEl.addEventListener('dragstart', () => {
      taskEl.classList.add('dragging');
    });
    taskEl.addEventListener('dragend', () => {
      taskEl.classList.remove('dragging');
    });

    document.getElementById(task.status).querySelector('.task-list').appendChild(taskEl);
  });
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  try {
    await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, userId }),
    });

    showNotification('Nouvelle tâche créée avec succès');
    loadTasks();
  } catch (error) {
    console.error(error);
    showNotification('Erreur lors de la création de la tâche', 'error');
  }
});

// Drag-and-drop
document.querySelectorAll('.task-list').forEach(list => {
  list.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    list.appendChild(dragging);
  });

  list.addEventListener('drop', async e => {
    const taskId = document.querySelector('.dragging').dataset.id;
    const newStatus = list.parentElement.id;

    try {
      await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      showNotification('Tâche déplacée avec succès');
      loadTasks();
    } catch (error) {
      console.error(error);
      showNotification('Erreur lors du déplacement de la tâche', 'error');
    }
  });
});

function showTaskDetails(taskEl) {
  const titleInput = document.getElementById('taskTitleInput');
  const descriptionInput = document.getElementById('taskDescriptionInput');
  const taskId = taskEl.dataset.id;

  titleInput.value = taskEl.dataset.title;
  descriptionInput.value = taskEl.dataset.description;
  document.getElementById('taskDate').textContent = taskEl.dataset.created_at;
  document.getElementById('taskCreator').textContent = taskEl.dataset.username;

  document.getElementById('saveChanges').onclick = async () => {
    const newTitle = document.getElementById('taskTitleInput').value;
    const newDescription = document.getElementById('taskDescriptionInput').value;

    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la tâche');
      }

      showNotification('Tâche mise à jour avec succès');
      loadTasks();
      closeModal();
    } catch (error) {
      console.error(error);
      showNotification('Une erreur est survenue lors de la mise à jour de la tâche', 'error');
    }
  };

  document.getElementById('deleteTask').onclick = async () => {
    try {
      const response = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la tâche');
      }

      showNotification('Tâche supprimée avec succès');
      loadTasks();
      closeModal();
    } catch (error) {
      console.error(error);
      showNotification('Une erreur est survenue lors de la suppression de la tâche', 'error');
    }
  };

  document.querySelector('.modal-overlay').style.display = 'block';
  document.getElementById('taskDetailsModal').style.display = 'block';
}

function closeModal() {
  document.querySelector('.modal-overlay').style.display = 'none';
  document.getElementById('taskDetailsModal').style.display = 'none';
}

document.getElementById('closeModal').addEventListener('click', closeModal);

// Déconnexion
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('userId');
  window.location.href = 'index.html';
});

loadTasks();