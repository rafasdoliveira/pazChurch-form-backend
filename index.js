const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const { createClient } = require('@supabase/supabase-js');

const url = 'https://tdaoylpfzkadjqrluqdm.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYW95bHBmemthZGpxcmx1cWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMDA4MTEsImV4cCI6MjAyODg3NjgxMX0.4_RcRK4QgW8GnGjshFTV56Kql6UWqzV18lVlVMi4I4k';

const app = express();
const port = 3001;
const supabase = createClient(url, apiKey);

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const home = (req, res) => {
    res.sendFile('index.html', { root: __dirname });
};

const helloworld = (req, res) => {
    res.send("<h1>Hello World!</h1>");
};

const cadastroindividual = async (req, res) => {
    console.log(req)
    const { nome, data_nascimento, sexo, telefone, cep, cidade, logradouro, numero_casa, bairro, lider, pastor, campus } = req.body;

    try {
        const response  = await supabase
            .from("novos_convertidos")
            .insert([{ nome, data_nascimento, sexo, telefone, cep, cidade, logradouro, numero_casa, bairro, lider, pastor, campus }]);
            console.log(response)
            res.status(201).json();
    } catch (error) {
        res.status(400).json({ msg: `Erro ${error.message}! Contate o responsável!` });
    }
};

app.get('/', home);
app.get('/helloworld', helloworld);
app.post('/cadastroindividual', cadastroindividual);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
