# Progim Web Case

Bu proje, öğrenci ve ders yönetimi için geliştirilmiş Fullstack Web Uygulamasıdır.
Backend kısmı Node.js + Express.js, veritabanı ise PostgreSQL (Supabase üzerinde) çalışmaktadır.
Frontend kısmı React + Tailwind CSS ile geliştirilmiştir.

## 1. Clone Repo

```bash
# Repoyu Klonla
git clone https://github.com/oyelmali/Progim-WebCase.git
cd Progim-WebCase
```
## 2. Backend Ayarları
```bash
# Backend klasörüne geç ve .env dosyası oluştur:
cd backend
nano .env 


# .env içeriği (örnek):
# PostgreSQL Ayarları
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=ogrenci_yonetim_db
DB_PASSWORD=1234
DB_PORT=5432

# Supabase bağlantı linki buraya
DATABASE_URL=postgresql://postgres:1234@localhost:5432/ogrenci_yonetim_db

# JWT Ayarları
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d

# Sunucu Ayarları
PORT=5000


```

## 3. Supabase Veritabanı Kurulumu
Supabase üzerinde yeni bir proje aç. Ardından veritabanına bağlan ve aşağıdaki SQL sorgusunu çalıştır:
```bash
-- Önce tabloları temizle (varsa)
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users tablosu
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STUDENT' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Students tablosu
CREATE TABLE public.students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Courses tablosu
CREATE TABLE public.courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    duration_hours NUMERIC(5,2)
);

-- Enrollments tablosu
CREATE TABLE public.enrollments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrollment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id),
    CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Örnek veriler (Users, Students, Courses, Enrollments)
-- (Burada uzun INSERT scriptlerini README’ye ekledik, kopyalayıp yapıştırabilirsin)
```

## 4. Docker ile Çalıştırma
Projeyi Docker Compose ile çalıştırmak için:
```bash
docker-compose up --build
```

## 5. Uygulamayı Test Et
Konteyner çalışmaya başladıktan sonra tarayıcıdan kontrol et:
```bash
http://localhost
```




