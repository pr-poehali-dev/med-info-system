
INSERT INTO t_p69760893_med_info_system.access_groups (name, description, permissions) VALUES
('admin', 'Главный врач / Администратор', '{"patients.view":true,"patients.edit":true,"patients.export":true,"schedule.view":true,"schedule.edit":true,"reports.view":true,"staff.view":true,"staff.edit":true,"settings.edit":true,"documents.view":true,"documents.edit":true,"prices.view":true,"prices.edit":true}'::jsonb),
('doctor', 'Врач', '{"patients.view":true,"patients.edit":true,"patients.export":false,"schedule.view":true,"schedule.edit":false,"reports.view":false,"staff.view":false,"staff.edit":false,"settings.edit":false,"documents.view":true,"documents.edit":false,"prices.view":true,"prices.edit":false}'::jsonb),
('registrar', 'Регистратор', '{"patients.view":true,"patients.edit":true,"patients.export":false,"schedule.view":true,"schedule.edit":true,"reports.view":false,"staff.view":false,"staff.edit":false,"settings.edit":false,"documents.view":true,"documents.edit":false,"prices.view":true,"prices.edit":false}'::jsonb),
('accountant', 'Бухгалтер', '{"patients.view":false,"patients.edit":false,"patients.export":false,"schedule.view":true,"schedule.edit":false,"reports.view":true,"staff.view":false,"staff.edit":false,"settings.edit":false,"documents.view":true,"documents.edit":true,"prices.view":true,"prices.edit":true}'::jsonb);

INSERT INTO t_p69760893_med_info_system.specializations (name) VALUES
('Терапевт'),('Кардиолог'),('Гинеколог'),('Хирург'),('УЗИ-специалист'),
('Невролог'),('Офтальмолог'),('Ортопед'),('Дерматолог'),('Психолог'),('Логопед');

INSERT INTO t_p69760893_med_info_system.branches (name, address, phone) VALUES
('Центральный', 'ул. Ленина, 42', '+7 (800) 000-00-00'),
('Северный', 'пр. Победы, 17', '+7 (800) 000-00-01');

INSERT INTO t_p69760893_med_info_system.rooms (branch_id, number, name) VALUES
(1,'101','Кабинет терапевта'),(1,'102','УЗИ-кабинет'),
(1,'103','Кабинет гинеколога'),(1,'104','Процедурная'),
(2,'201','Кабинет кардиолога'),(2,'202','Кабинет хирурга');

INSERT INTO t_p69760893_med_info_system.services (code, name, duration_min, price) VALUES
('A01.31.001','Первичный приём терапевта',30,2500),
('A01.31.002','Повторный приём терапевта',20,1800),
('A04.16.001','УЗИ брюшной полости',25,3200),
('A05.10.006','ЭКГ с расшифровкой',15,1500),
('A01.17.001','Консультация кардиолога',30,3000),
('A06.31.001','Гастроскопия',45,6500);
