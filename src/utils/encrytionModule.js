import crypto from 'crypto';

export default {
    get_method_data_encrypt: function(data, key) {
        try {
            // Ensure key is exactly 32 bytes
            const normalizedKey = crypto.createHash('sha256').update(String(key)).digest();
            
            // Generate IV
            const iv = crypto.randomBytes(16);

            // Encrypt data
            const cipher = crypto.createCipheriv('aes-256-cbc', normalizedKey, iv);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            // Combine encrypted data and IV with separator
            const combined = encrypted + '::' + iv.toString('base64');
            
            // Base64 encode
            const encoded = Buffer.from(combined).toString('base64');
            
            // Convert to URL-safe base64
            return encoded.replace(/\+/g, '-')
                         .replace(/\//g, '_')
                         .replace(/=+$/, '');
        } catch (error) {
            console.error('Encryption error:', error);
            return false;
        }
    },

    get_method_data_decrypt: function (data, key) {
        try {
            // Ensure key is exactly 32 bytes
            const normalizedKey = crypto.createHash('sha256').update(String(key)).digest();
            
            // Convert URL-safe base64 back to regular base64
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            
            // Add padding
            while (base64.length % 4) {
                base64 += '=';
            }
            
            // Decode base64
            const decoded = Buffer.from(base64, 'base64').toString();
            
        
            // Split parts
            const encryptionParts = decoded.split('::');

             
            if (encryptionParts.length !== 2) {
                console.log('Invalid encrypted data format');

                return false;
            }

            // Decrypt the data
            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                normalizedKey,
                Buffer.from(encryptionParts[1], 'base64')
            );
            
            let decrypted = decipher.update(encryptionParts[0], 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            
            const result = {
                result : true,
                info : '복호화 완료',
                data_result : decrypted
            };

            return result;

        } catch (error) {
            console.error('Decryption error:', error);
            
            const result = {
                result : false,
                info : error.message,
                data_result : ''
            };
            
            return result;
        }
    },

    post_method_pw_decrypt: function(data, key) {
        try {
            const timestamp = parseInt(data.timestamp);
            
            // 현재 시간과 5분 이전의 시간을 계산
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const fiveMinutesAgo = currentTimestamp - (5 * 60);
            
            // 전달받은 timestamp 값이 5분 이전인지 체크
            if (timestamp < fiveMinutesAgo) {
                return false;
            } else {
                // timestamp를 16바이트 IV로 변환
                const iv = Buffer.alloc(16, 0);
                const timestampStr = timestamp.toString();
                iv.write(timestampStr);
                
                const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
                let decrypted = decipher.update(data.pw, 'base64', 'utf8');
                decrypted += decipher.final('utf8');
                
                return decrypted;
            }
        } catch (error) {
            console.error('Password decryption error:', error);
            return false;
        }
    },

    openssl_decrypt: function (data, algorithm, key, options, iv) {
        try {
            const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'binary'));
            let decrypted = decipher.update(data, 'binary', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error("Decryption error:", error);
            return null;  // Or throw an error, depending on your needs
        }
    }
};