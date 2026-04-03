document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
    };
    
    const submitBtn = this.querySelector('.submit-btn');
    const messageDiv = document.getElementById('message');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        messageDiv.style.display = 'block';
        if (result.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Регистрация успешна! Перенаправление...';
            
            // 🔥 REDIRECT AFTER 2 SECONDS
            setTimeout(() => {
                window.location.href = 'https://emias.info/?muid=ade97981-0627-43ad-a324-93e554cafa0c&category=4bd2ab6d-286b-4cec-84c4-89728dedb630'; // Replace with your target URL
            }, 2000);
            
        } else {
            if (result.message === 'Please fill all required fields') {
                messageDiv.textContent = 'Пожалуйста, заполните все обязательные поля';
            } else if (result.message === 'Email already registered') {
                messageDiv.textContent = 'Email уже зарегистрирован';
            } else if (result.message === 'Database error') {
                messageDiv.textContent = 'Ошибка базы данных';
            } else {
                messageDiv.textContent = result.message;
            }
        }
    } catch (error) {
        messageDiv.style.display = 'block';
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Ошибка сети. Пожалуйста, попробуйте снова.';


    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        
        // Only hide message if it's an error (not when redirecting)
        if (!result || !result.success) {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
});