const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı header'dan al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı token ID'sinden bul ve req nesnesine ekle (şifreyi hariç tutarak)
      const userResult = await db.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
      if(userResult.rows.length === 0){
        return res.status(401).json({ message: 'Yetki yok, kullanıcı bulunamadı.' });
      }
      req.user = userResult.rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Yetki yok, token geçersiz.' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Yetki yok, token bulunamadı.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Erişim reddedildi. Admin yetkisi gerekli.' });
  }
};

