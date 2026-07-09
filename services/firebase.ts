// Unico punto di accesso alle istanze Firebase per il layer services.
// Gli screen non devono importare da qui né da firebaseconfig:
// passano sempre dalle funzioni esposte dai moduli in /services.
export { auth, db } from "../firebaseconfig";
