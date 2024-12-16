const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Remplacez par votre mot de passe MySQL si nécessaire
    database: 'todolist',
});

// Connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL.');
});

// API : Connexion utilisateur
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Veuillez fournir un nom d\'utilisateur et un mot de passe.' });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête SQL :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (results.length > 0) {
            res.json({ message: 'Connexion réussie.', userId: results[0].id });
        } else {
            res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }
    });
});

// API : Créer une tâche
app.post('/tasks', (req, res) => {
    const { title, description, userId } = req.body;

    if (!title || !userId) {
        return res.status(400).json({ message: 'Veuillez fournir un titre et un utilisateur.' });
    }

    const query = 'INSERT INTO tasks (title, description, user_id, status) VALUES (?, ?, ?, ?)';
    db.query(query, [title, description, userId, 'todo'], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion de la tâche :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        res.json({ message: 'Tâche créée avec succès.', taskId: result.insertId });
    });
});

// API : Récupérer les tâches
app.get('/tasks', (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Veuillez fournir un identifiant utilisateur.' });
    }

    const query = 'SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des tâches :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        res.json(results);
    });
});

// API : Mettre à jour une tâche
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    let query = 'UPDATE tasks SET ';
    const updates = [];
    const values = [];

    if (title) {
        updates.push('title = ?');
        values.push(title);
    }
    if (description) {
        updates.push('description = ?');
        values.push(description);
    }
    if (status) {
        updates.push('status = ?');
        values.push(status);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'Aucune modification fournie.' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la tâche :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée.' });
        }

        res.json({ message: 'Tâche mise à jour avec succès.' });
    });
});

// API : Supprimer une tâche
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la tâche :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée.' });
        }

        res.json({ message: 'Tâche supprimée avec succès.' });
    });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});