
INSERT INTO public.ai_learning_logs (user_message, detected_intent, detected_entities, confidence, user_accepted) VALUES
-- Landing variations
('quiero una pagina para mi negocio', 'landing', '{"businessName":"Mi Empresa","sections":["navbar","hero","features","contact","footer"],"colorScheme":"purple","industry":"landing"}', 0.85, true),
('necesito un sitio web corporativo', 'landing', '{"businessName":"Mi Empresa","sections":["navbar","hero","features","contact","footer"],"colorScheme":"modern","industry":"landing"}', 0.80, true),
('hazme una landing page profesional', 'landing', '{"businessName":"Mi Empresa","sections":["navbar","hero","features","contact","footer"],"colorScheme":"purple","industry":"landing"}', 0.90, true),
('pagina de presentacion para mi startup', 'landing', '{"businessName":"Mi Startup","sections":["navbar","hero","features","contact","footer"],"colorScheme":"modern","industry":"landing"}', 0.82, true),
('sitio web para mi empresa de servicios', 'landing', '{"businessName":"Mi Empresa","sections":["navbar","hero","features","about","contact","footer"],"colorScheme":"purple","industry":"landing"}', 0.78, true),

-- Restaurant variations
('necesito un sitio para mi restaurante', 'restaurant', '{"businessName":"Mi Restaurante","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.88, true),
('pagina web para mi cafeteria', 'restaurant', '{"businessName":"Mi Cafetería","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.85, true),
('quiero una pagina para vender comida', 'restaurant', '{"businessName":"Mi Restaurante","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.75, true),
('sitio de mi taqueria el buen sabor', 'restaurant', '{"businessName":"El Buen Sabor","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.90, true),
('web para pizzeria con menu y delivery', 'restaurant', '{"businessName":"Mi Pizzería","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.88, true),
('lugar para comer algo rico', 'restaurant', '{"businessName":"Mi Restaurante","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.60, true),
('negocio de comida callejera', 'restaurant', '{"businessName":"Mi Restaurante","sections":["navbar","hero","menu","contact","footer"],"colorScheme":"warm","industry":"restaurant"}', 0.65, true),

-- Ecommerce variations
('hazme una tienda para vender ropa', 'ecommerce', '{"businessName":"Mi Tienda","sections":["navbar","hero","features","pricing","footer"],"colorScheme":"blue","industry":"ecommerce"}', 0.90, true),
('quiero vender productos en linea', 'ecommerce', '{"businessName":"Mi Tienda","sections":["navbar","hero","features","pricing","footer"],"colorScheme":"blue","industry":"ecommerce"}', 0.85, true),
('tienda online para zapatos', 'ecommerce', '{"businessName":"Mi Tienda","sections":["navbar","hero","features","pricing","footer"],"colorScheme":"blue","industry":"ecommerce"}', 0.88, true),
('necesito un marketplace', 'ecommerce', '{"businessName":"Mi Marketplace","sections":["navbar","hero","features","pricing","footer"],"colorScheme":"modern","industry":"ecommerce"}', 0.82, true),
('pagina para mi negocio de joyeria', 'ecommerce', '{"businessName":"Mi Joyería","sections":["navbar","hero","features","pricing","gallery","footer"],"colorScheme":"elegant","industry":"ecommerce"}', 0.80, true),

-- Salon / Barberia
('pagina de mi barberia', 'salon', '{"businessName":"Mi Barbería","sections":["navbar","hero","features","pricing","gallery","contact","footer"],"colorScheme":"dark","industry":"salon"}', 0.90, true),
('web para mi salon de belleza', 'salon', '{"businessName":"Mi Salón","sections":["navbar","hero","features","pricing","gallery","contact","footer"],"colorScheme":"pink","industry":"salon"}', 0.88, true),
('necesito pagina para peluqueria canina', 'salon', '{"businessName":"Mi Peluquería","sections":["navbar","hero","features","pricing","contact","footer"],"colorScheme":"pink","industry":"salon"}', 0.75, true),
('spa y centro de estetica', 'salon', '{"businessName":"Mi Spa","sections":["navbar","hero","features","pricing","gallery","contact","footer"],"colorScheme":"pink","industry":"salon"}', 0.82, true),

-- Fitness
('sitio web para mi gimnasio', 'fitness', '{"businessName":"Mi Gym","sections":["navbar","hero","features","pricing","contact","footer"],"colorScheme":"green","industry":"fitness"}', 0.90, true),
('pagina para centro de crossfit', 'fitness', '{"businessName":"Mi CrossFit","sections":["navbar","hero","features","pricing","contact","footer"],"colorScheme":"green","industry":"fitness"}', 0.88, true),
('web para estudio de yoga', 'fitness', '{"businessName":"Mi Estudio Yoga","sections":["navbar","hero","features","pricing","contact","footer"],"colorScheme":"green","industry":"fitness"}', 0.85, true),
('quiero un sitio para entrenamiento personal', 'fitness', '{"businessName":"Mi Gym","sections":["navbar","hero","features","pricing","contact","footer"],"colorScheme":"green","industry":"fitness"}', 0.78, true),

-- Portfolio
('quiero mostrar mis fotos', 'portfolio', '{"businessName":"Mi Portfolio","sections":["navbar","hero","gallery","about","contact","footer"],"colorScheme":"purple","industry":"portfolio"}', 0.85, true),
('necesito un portfolio profesional', 'portfolio', '{"businessName":"Mi Portfolio","sections":["navbar","hero","gallery","about","contact","footer"],"colorScheme":"purple","industry":"portfolio"}', 0.90, true),
('pagina para mostrar mis trabajos de diseno', 'portfolio', '{"businessName":"Mi Portfolio","sections":["navbar","hero","gallery","about","contact","footer"],"colorScheme":"purple","industry":"portfolio"}', 0.82, true),
('hoja de vida digital interactiva', 'portfolio', '{"businessName":"Mi Portfolio","sections":["navbar","hero","gallery","about","contact","footer"],"colorScheme":"modern","industry":"portfolio"}', 0.75, true),

-- Clinic
('pagina para mi consultorio dental', 'clinic', '{"businessName":"Mi Clínica","sections":["navbar","hero","features","team","contact","faq","footer"],"colorScheme":"blue","industry":"clinic"}', 0.88, true),
('web para clinica medica', 'clinic', '{"businessName":"Mi Clínica","sections":["navbar","hero","features","team","contact","faq","footer"],"colorScheme":"blue","industry":"clinic"}', 0.90, true),
('sitio de mi consultorio pediatrico', 'clinic', '{"businessName":"Mi Consultorio","sections":["navbar","hero","features","team","contact","faq","footer"],"colorScheme":"blue","industry":"clinic"}', 0.85, true),

-- Lawyer
('pagina para mi despacho de abogados', 'lawyer', '{"businessName":"Mi Bufete Legal","sections":["navbar","hero","features","about","team","contact","faq","footer"],"colorScheme":"dark","industry":"lawyer"}', 0.90, true),
('web para bufete juridico', 'lawyer', '{"businessName":"Mi Bufete Legal","sections":["navbar","hero","features","about","team","contact","faq","footer"],"colorScheme":"dark","industry":"lawyer"}', 0.88, true),
('necesito sitio para mi notaria', 'lawyer', '{"businessName":"Mi Notaría","sections":["navbar","hero","features","about","contact","faq","footer"],"colorScheme":"dark","industry":"lawyer"}', 0.80, true),

-- Accounting
('pagina para despacho contable', 'accounting', '{"businessName":"Mi Contaduría","sections":["navbar","hero","features","about","contact","faq","footer"],"colorScheme":"cool","industry":"accounting"}', 0.88, true),
('web de contabilidad y asesoria fiscal', 'accounting', '{"businessName":"Mi Contaduría","sections":["navbar","hero","features","about","contact","faq","footer"],"colorScheme":"cool","industry":"accounting"}', 0.85, true),

-- Photography
('pagina para mi estudio de fotografia', 'photography', '{"businessName":"Mi Estudio Fotográfico","sections":["navbar","hero","gallery","about","pricing","contact","footer"],"colorScheme":"dark","industry":"photography"}', 0.90, true),
('web para fotografo de bodas', 'photography', '{"businessName":"Mi Estudio Fotográfico","sections":["navbar","hero","gallery","about","pricing","contact","footer"],"colorScheme":"dark","industry":"photography"}', 0.85, true),

-- Music
('pagina para mi banda de musica', 'music', '{"businessName":"Mi Estudio Musical","sections":["navbar","hero","gallery","about","contact","footer"],"colorScheme":"purple","industry":"music"}', 0.88, true),
('web para estudio de grabacion', 'music', '{"businessName":"Mi Estudio Musical","sections":["navbar","hero","gallery","about","contact","footer"],"colorScheme":"purple","industry":"music"}', 0.85, true),

-- Hotel
('pagina para mi hotel boutique', 'hotel', '{"businessName":"Mi Hotel","sections":["navbar","hero","features","gallery","pricing","contact","footer"],"colorScheme":"elegant","industry":"hotel"}', 0.90, true),
('web para airbnb y hospedaje', 'hotel', '{"businessName":"Mi Hotel","sections":["navbar","hero","features","gallery","pricing","contact","footer"],"colorScheme":"elegant","industry":"hotel"}', 0.82, true),

-- Real Estate
('pagina de inmobiliaria', 'realestate', '{"businessName":"Mi Inmobiliaria","sections":["navbar","hero","features","gallery","contact","footer"],"colorScheme":"elegant","industry":"realestate"}', 0.90, true),
('web para venta de casas y departamentos', 'realestate', '{"businessName":"Mi Inmobiliaria","sections":["navbar","hero","features","gallery","contact","footer"],"colorScheme":"elegant","industry":"realestate"}', 0.85, true),
('bienes raices y propiedades', 'realestate', '{"businessName":"Mi Inmobiliaria","sections":["navbar","hero","features","gallery","contact","footer"],"colorScheme":"elegant","industry":"realestate"}', 0.88, true),

-- Education
('pagina para mi academia de idiomas', 'education', '{"businessName":"Mi Academia","sections":["navbar","hero","features","pricing","testimonials","contact","footer"],"colorScheme":"blue","industry":"education"}', 0.88, true),
('web para cursos en linea', 'education', '{"businessName":"Mi Academia","sections":["navbar","hero","features","pricing","testimonials","contact","footer"],"colorScheme":"blue","industry":"education"}', 0.85, true),
('sitio de escuela de programacion', 'education', '{"businessName":"Mi Academia","sections":["navbar","hero","features","pricing","testimonials","contact","footer"],"colorScheme":"modern","industry":"education"}', 0.82, true),

-- Veterinary
('pagina para clinica veterinaria', 'veterinary', '{"businessName":"Mi Veterinaria","sections":["navbar","hero","features","team","contact","faq","footer"],"colorScheme":"green","industry":"veterinary"}', 0.90, true),
('web para tienda de mascotas', 'veterinary', '{"businessName":"Mi Veterinaria","sections":["navbar","hero","features","team","contact","faq","footer"],"colorScheme":"green","industry":"veterinary"}', 0.80, true),

-- Agency
('pagina para mi agencia de marketing digital', 'agency', '{"businessName":"Mi Agencia","sections":["navbar","hero","features","about","contact","testimonials","footer"],"colorScheme":"modern","industry":"agency"}', 0.90, true),
('web para agencia creativa de diseno', 'agency', '{"businessName":"Mi Agencia","sections":["navbar","hero","features","about","contact","testimonials","footer"],"colorScheme":"modern","industry":"agency"}', 0.88, true),
('estudio de publicidad y branding', 'agency', '{"businessName":"Mi Agencia","sections":["navbar","hero","features","about","contact","testimonials","footer"],"colorScheme":"modern","industry":"agency"}', 0.82, true),

-- Technology
('pagina para empresa de software', 'technology', '{"businessName":"Mi Tech","sections":["navbar","hero","features","about","pricing","contact","footer"],"colorScheme":"modern","industry":"technology"}', 0.88, true),
('web para startup de tecnologia', 'technology', '{"businessName":"Mi Tech","sections":["navbar","hero","features","about","pricing","contact","footer"],"colorScheme":"modern","industry":"technology"}', 0.85, true),

-- Blog
('quiero crear un blog personal', 'blog', '{"businessName":"Mi Blog","sections":["navbar","hero","blog","about","footer"],"colorScheme":"cool","industry":"blog"}', 0.88, true),
('pagina para escribir articulos y noticias', 'blog', '{"businessName":"Mi Blog","sections":["navbar","hero","blog","about","footer"],"colorScheme":"cool","industry":"blog"}', 0.85, true),

-- Dashboard
('necesito un panel de administracion', 'dashboard', '{"businessName":"Dashboard","sections":["navbar","hero","features","stats","footer"],"colorScheme":"dark","industry":"dashboard"}', 0.88, true),
('dashboard para gestionar datos', 'dashboard', '{"businessName":"Dashboard","sections":["navbar","hero","features","stats","footer"],"colorScheme":"dark","industry":"dashboard"}', 0.85, true);
