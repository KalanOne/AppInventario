# 📦 Sistema de Gestión de Inventario

<p align="center">
  <img src="ScreenShots/Android Inventory.png" alt="Chat visual" width="30%" style="border-radius: 25px; margin-right: 10px;" />
  <img src="ScreenShots/Android Inventory Product.png" alt="Recursos de ayuda" width="30%" style="border-radius: 25px; margin: 0 10px;" />
  <img src="ScreenShots/Android New Transaction.png" alt="Descubrir" width="30%" style="border-radius: 25px; margin-left: 10px;" />
</p>

<div align="center">
  <img src="https://img.shields.io/github/last-commit/KalanOne/Chatbot?color=4ade80&label=Last%20Commit&style=flat-square" alt="Last Commit" style="border-radius:5px" />
  <img src="https://img.shields.io/github/stars/KalanOne/Chatbot?style=flat-square&color=facc15" alt="Stars" style="border-radius:5px" />
  <img src="https://img.shields.io/github/issues/KalanOne/Chatbot?style=flat-square&color=ef4444" alt="Issues" style="border-radius:5px" />
  <img src="https://img.shields.io/github/license/KalanOne/Chatbot?style=flat-square&color=6366f1" alt="License" style="border-radius:5px" />
</div>

---

> Plataforma moderna y escalable para el **registro, control y exportación de inventario**, con arquitectura **backend en NestJS** y **frontend en React Native + Expo**. Incluye **reportes Excel**, gestión de transacciones, almacenes y control por número de serie.

---

## 🧩 Tecnologías

### [Backend](https://github.com/KalanOne/AppInventarioBack) - [NestJS](https://nestjs.com/)
- PostgreSQL + TypeORM
- PM2 para despliegue
- Generación de reportes Excel (`exceljs`)
- Validaciones por transacciones
- Agrupación por código de barras y seriales
- Afectaciones configurables (entrada/salida con o sin impacto)

### Frontend - [React Native + Expo](https://expo.dev/)
- React Native Paper UI
- Soporte para dark theme y diversos colores
- Compartir o guardar reportes (`expo-sharing`)
- Soporte multiplataforma (Android / iOS / Web)
- Visualización moderna del inventario
- Flexbox + Portales + Modal dinámico

---

## 🚀 Instalación rápida

```bash
npm install
npx expo start
```

---

## 📤 Reportes Excel

- **Agrupación por artículo y almacén**
- **Total de unidades** (ajustado por factor y múltiplo)
- **Listado de números de serie**
- Compatible con **Microsoft Excel**, **Google Sheets**, y otros

---

## 📦 Funcionalidades destacadas

✅ Soporte multi-almacén  
✅ Transacciones de entrada y salida  
✅ Control de productos con y sin número de serie  
✅ Manejo de afectaciones configurables  
✅ Reportes en tiempo real  
✅ App móvil para compartir/exportar reportes  

---

## ⚙️ PM2 (producción)

```bash
# Iniciar todos los procesos
pm2 start pm2.config.js

# Reiniciar todos (con cambios)
pm2 restart all
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - [Ver aquí](LICENSE)

---

## 👨‍💻 Autor

Desarrollado con ❤️ por **[Tu Nombre o Equipo]**  
Contáctame en [alangarciadiazgardy@gmail.com](mailto:alangarciadiazgardy@gmail.com) o en [LinkedIn](https://www.linkedin.com/in/alan-garcia-diaz-811428264/)

---