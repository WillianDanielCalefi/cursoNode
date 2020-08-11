'use strict';

const repository = require('../repositories/customer-repository');
const md5 = require('md5');
const authService = require('../services/auth-service');

const emailService = require('../services/email-service');

exports.post = async(req, res, next) => {
        try{
            await repository.create({
                name: req.body.name,
                email: req.body.email,
                password: md5(req.body.password + global.SALT_KEY)
            });

            emailService.send(req.body.email, 
                                'Bem vindo ao Curso de API com Node',
                                global.EMAIL_TMPL.replace('{0}', req.body.name));

            res.status(201).send({ 
                message: 'Cliente cadastrado com sucesso!'
            });
        }
        catch (e){
            res.status(500).send({
                message: 'Falha ao processar sua requisição'
            });
        }
};

exports.authenticate = async(req, res, next) => {
    try{
        const customer = await repository.authenticate({
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });

        if(!customer){
            res.status(404).send({
                message: 'Usuário ou senha inválidos!'
        });
        return;
        }

        const token = await authService.generateToken({ 
            email: customer.email,
            name: customer.name 
        });

        res.status(201).send({
            token: token,
            data: {
                email: customer.email,
                name: customer.name
            }
        });
    }
    catch (e){
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
};