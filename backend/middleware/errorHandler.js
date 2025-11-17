const { body, validationResult } = require('express-validator');

// Validações para contatos
const validateContact = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nome é obrigatório')
        .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('email')
        .optional()
        .isEmail().withMessage('Email deve ser válido')
        .normalizeEmail(),
    
    body('phone')
        .optional()
        .matches(/^[\d\s\-\(\)\+]+$/).withMessage('Telefone deve conter apenas números, espaços, hífens e parênteses')
        .isLength({ min: 8, max: 20 }).withMessage('Telefone deve ter entre 8 e 20 caracteres'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Observações não podem exceder 500 caracteres'),
    
    // Middleware para verificar os resultados da validação
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }));
            
            return res.status(400).json({
                success: false,
                error: 'Dados de validação inválidos',
                details: errorMessages
            });
        }
        
        next();
    }
];

// Validações para usuário (caso precise)
const validateUser = [
    body('email')
        .isEmail().withMessage('Email deve ser válido')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados de validação inválidos',
                details: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateContact,
    validateUser
};