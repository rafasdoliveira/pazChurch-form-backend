const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const url = 'https://tdaoylpfzkadjqrluqdm.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYW95bHBmemthZGpxcmx1cWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMDA4MTEsImV4cCI6MjAyODg3NjgxMX0.4_RcRK4QgW8GnGjshFTV56Kql6UWqzV18lVlVMi4I4k';

const app = express();
const port = 3001;
const supabase = createClient(url, apiKey);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')  // 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) 
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        const filetypes = /csv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Apenas arquivos CSV são permitidos!');
        }
    }
});

const home = (req, res) => {
    res.sendFile('index.html', { root: __dirname });
};

const helloworld = (req, res) => {
    res.send("<h1>Hello World!</h1>");
};

const cadastroindividual = async (req, res) => {
    const { nome, data_nascimento, sexo, telefone, cep, cidade, logradouro, numero_casa, bairro, lider, pastor, campus } = req.body;

    try {
        const response = await supabase
            .from("novos_convertidos")
            .insert([{ nome, data_nascimento, sexo, telefone, cep, cidade, logradouro, numero_casa, bairro, lider, pastor, campus }]);
        console.log(response);
        res.status(201).json();
    } catch (error) {
        res.status(400).json({ msg: `Erro ${error.message}! Contate o responsável!` });
    }
};

const cadastrocsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Por favor, selecione algum arquivo!' });
    }

    const results = [];
    
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log({ results });
            fs.unlinkSync(req.file.path); 

            for(const item of results) {
                try {

                    const dateParts = item.data_nascimento.split("/");
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

                    const { data, error} = await supabase
                    .from("novos_convertidos")
                    .insert({
                        nome: item.nome, 
                        data_nascimento: formattedDate,
                        telefone: item.telefone,
                        cep: item.cep,
                        cidade: item.cidade,
                        logradouro: item.logradouro,
                        bairro: item.bairro,
                        campus: item.campus,
                        numero_casa: item.numero_casa,
                        lider: item.lider,
                        pastor: item.pastor
                    })
                    if(error) {
                        console.error(`Erro ao inserir item: ${error.message}`);
                        res.status(500).json({ msg: `Erro ao inserir item ${error.message}`});
                        return
                    } else {
                    console.log(`Subiu para o banco!`)
                    }
                }
                catch(error) {
                    console.error(`Erro ao inserir item: ${error.message}`);
                    res.status(500).json({ msg: `Erro ao inserir item: ${error.message}`});
                    return;
                }
            }
            res.status(200).json({ msg: 'Arquivo enviado com sucesso!' });
        })
        .on('error', (error) => {
            console.log({ error });
            res.status(500).json({ msg: 'Erro ao enviar arquivo.' });
        });
};


app.get('/', home);
app.get('/helloworld', helloworld);
app.post('/cadastroindividual', cadastroindividual);
app.post('/cadastrocsv', upload.single('file'), cadastrocsv);  

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});





