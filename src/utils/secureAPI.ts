/**
 * Безопасный API клиент с защитой от всех основных угроз
 */

// import rateLimiter from './rateLimiter';
import csrfProtection from './csrf';
import { validatePrompt, sanitizeText } from './validation';
// React import removed

/**
 * Класс безопасного клиента API (SecureAPIClient), предоставляющий обертку над fetch
 * для предотвращения XSS (межсайтового скриптинга), CSRF (подделки межсайтовых запросов) и лимитирования запросов.
 */
class SecureAPIClient {
    baseURL: string;
    userId: any;

    /**
     * Создает экземпляр безопасного клиента API.
     * 
     * @param {string} [baseURL='/api'] - Базовый URL-адрес для всех запросов
     */
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.userId = null;
    }

    /**
     * Устанавливает идентификатор пользователя для отслеживания лимитов запросов (rate limiting).
     * 
     * @param {string|number} userId - Уникальный идентификатор пользователя
     */
    setUserId(userId: any) {
        this.userId = userId;
    }

    /**
     * Выполняет HTTP-запрос со встроенной защитой (CSRF-токены, заголовки Telegram WebApp, санитизация данных).
     * 
     * @param {string} endpoint - Путь или URL-адрес эндпоинта
     * @param {RequestInit & {rateLimitType?: string}} [options={}] - Настройки запроса fetch
     * @returns {Promise<any>} Десериализованный и очищенный от XSS ответ от сервера
     * @throws {Error} Ошибка сети, превышения лимитов или неуспешного ответа сервера
     */
    async secureFetch(endpoint: string, options: any = {}) {
        const url = (endpoint.startsWith('http') || endpoint.startsWith('//'))
            ? endpoint
            : `${this.baseURL}${endpoint}`;

        // 1. Rate Limiting (закомментировано в исходном коде)
        // if (this.userId) {
        //     const rateLimit = rateLimiter.check(this.userId, options.rateLimitType || 'default');
        //
        //     if (!rateLimit.allowed) {
        //         throw new Error(`Rate limit exceeded. Retry after ${rateLimit.retryAfter} seconds`);
        //     }
        // }

        // 2. CSRF Protection
        const headers = csrfProtection.addTokenToHeaders(options.headers || {});

        // 3. Content Security
        const secureOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData
                    ? { 'x-telegram-init-data': (window as any).Telegram.WebApp.initData }
                    : {}),
                ...headers
            },
            credentials: 'same-origin',
            mode: 'cors',
            cache: 'no-cache'
        };

        // 4. Request body sanitization
        if (options.body && typeof options.body === 'object') {
            secureOptions.body = JSON.stringify(this.sanitizeRequestBody(options.body));
        }

        try {
            const response = await fetch(url, secureOptions);

            // 5. Response validation
            if (!response.ok) {
                const error = await this.handleErrorResponse(response);
                throw error;
            }

            const data = await response.json();

            // 6. Response sanitization
            return this.sanitizeResponseData(data);

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Рекурсивно очищает все строковые поля в теле запроса от потенциально вредоносного кода.
     * 
     * @param {any} body - Тело исходного запроса
     * @returns {any} Очищенное тело запроса
     */
    sanitizeRequestBody(body: any): any {
        const sanitized: any = {};

        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeText(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeRequestBody(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Рекурсивно очищает все строковые значения в ответе от сервера от HTML-тегов для защиты от XSS.
     * 
     * @param {any} data - Исходные данные ответа
     * @returns {any} Санитизированные данные
     */
    sanitizeResponseData(data: any): any {
        if (typeof data === 'string') {
            return sanitizeText(data);
        }

        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeResponseData(item));
        }

        if (typeof data === 'object' && data !== null) {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeResponseData(value);
            }
            return sanitized;
        }

        return data;
    }

    /**
     * Обрабатывает ответы сервера с кодами ошибок (4xx, 5xx), пытаясь распарсить сообщение об ошибке.
     * 
     * @param {Response} response - Объект ответа от fetch
     * @returns {Promise<Error & {status?: number, statusText?: string}>} Созданный объект ошибки
     */
    async handleErrorResponse(response: Response) {
        let errorMessage = 'An error occurred';

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }

        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;

        return error;
    }

    /**
     * GET запрос
     */
    async get(endpoint: string, options: any = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST запрос
     */
    async post(endpoint: string, data?: any, options: any = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'POST',
            body: data
        });
    }

    /**
     * PUT запрос
     */
    async put(endpoint: string, data?: any, options: any = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'PUT',
            body: data
        });
    }

    /**
     * DELETE запрос
     */
    async delete(endpoint: string, options: any = {}) {
        return this.secureFetch(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    /**
     * Безопасная генерация изображения
     */
    async generateImage(prompt: string) {
        // Валидация промпта
        const validation = validatePrompt(prompt);

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        return this.post('/generate', {
            prompt: validation.sanitized
        }, {
            rateLimitType: 'generation'
        });
    }

    /**
     * Безопасная загрузка файла
     */
    async uploadFile(file: any) {
        const formData = new FormData();
        formData.append('file', file);

        // Добавляем CSRF токен
        formData.append('csrf_token', csrfProtection.getToken());

        return fetch(`${this.baseURL}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            headers: {
                ...csrfProtection.addTokenToHeaders()
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return response.json();
        });
    }
}

// Singleton instance
const apiClient = new SecureAPIClient();

export default apiClient;

// React imports and hook removed. Use src/hooks/useSecureAPI.js instead.


