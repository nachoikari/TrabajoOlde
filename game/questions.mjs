export const questions = [
    {
      id:'q1',topic:'Comprender',slide:2,label:'Una herramienta de intrusión',
      question:'¿Cuál de estas descripciones corresponde a Pegasus?',
      options:[
        'Un servicio de almacenamiento creado para instituciones públicas.',
        'Un programa espía de NSO Group destinado principalmente a gobiernos.',
        'Una aplicación de mensajería diseñada para proteger las fuentes.',
        'Un sistema de autorización judicial para investigar delitos graves.'
      ],correct:1,
      feedback:[
        'La presentación describe una herramienta de intrusión en teléfonos, no un servicio para almacenar información.',
        'Pegasus es un programa espía desarrollado por NSO Group y comercializado principalmente para organismos gubernamentales.',
        'La protección de fuentes aparece como un derecho amenazado por el spyware, no como una función de Pegasus.',
        'La autorización independiente es un control sobre la vigilancia. Pegasus es la herramienta cuya utilización debe someterse a esos controles.'
      ],hint:'Piense en quién desarrolla la herramienta y quién la adquiere.',
      source:'Marzocchi y Mazzini (2022).'
    },
    {
      id:'q2',topic:'Comprender',slide:2,label:'El ataque de cero clic',
      question:'¿Qué caracteriza a los ataques de cero clic?',
      options:[
        'Exigen que la persona acepte una solicitud de instalación.',
        'Dependen de que la persona abra un enlace recibido.',
        'Pueden infectar el dispositivo sin una acción consciente.',
        'Requieren que el operador tenga el teléfono físicamente.'
      ],correct:2,
      feedback:[
        'La característica señalada es que la infección puede producirse sin una acción consciente, como aceptar una instalación.',
        'Abrir un enlace implica interacción de la persona. Los ataques de cero clic pueden prescindir de esa acción.',
        'Los ataques de cero clic pueden infectar el teléfono sin que su propietario abra un enlace o realice una acción consciente.',
        'La presentación explica que el ataque puede producirse sin una acción consciente de la víctima. No lo define por la posesión física del teléfono.'
      ],hint:'La diferencia se encuentra en la participación que necesita la víctima.',source:'Marzocchi y Mazzini (2022); Di Salvo (2025).'
    },
    {
      id:'q3',topic:'Comprender',slide:2,label:'Los límites del cifrado',
      question:'¿Cómo puede el spyware obtener mensajes de una aplicación que utiliza cifrado?',
      options:[
        'Accediendo a los datos en el dispositivo antes de cifrarse o después de descifrarse.',
        'Recibiendo de la aplicación una copia pública de cada conversación cifrada.',
        'Esperando a que el usuario desactive todas las funciones de seguridad del teléfono.',
        'Obteniendo únicamente la ubicación, mientras el contenido permanece inaccesible.'
      ],correct:0,
      feedback:[
        'Al comprometer el dispositivo final, el programa puede acceder a información antes del cifrado o después del descifrado. Esto no exige romper necesariamente el cifrado de la aplicación.',
        'La explicación de la presentación se centra en el acceso al dispositivo final. No afirma que las aplicaciones publiquen copias de las conversaciones.',
        'El acceso descrito depende de comprometer el dispositivo. La presentación no lo condiciona a que el usuario desactive todas sus medidas de seguridad.',
        'La ubicación es una de las capacidades señaladas, pero el acceso puede abarcar también mensajes y otros datos del dispositivo.'
      ],hint:'Distinga la protección de los datos durante su transmisión del dispositivo que permite leerlos.',source:'Marzocchi y Mazzini (2022).'
    },
    {
      id:'q4',topic:'Analizar',slide:3,label:'Seguridad con límites',
      question:'Un gobierno invoca la seguridad nacional para utilizar spyware. ¿Qué debe exigirse según la presentación?',
      options:[
        'La adquisición legal del programa como única condición para utilizarlo.',
        'La reserva total de las operaciones sin ninguna revisión posterior.',
        'La aceptación de cualquier objetivo si una autoridad considera que es útil.',
        'Base legal, necesidad, proporcionalidad y supervisión independiente.'
      ],correct:3,
      feedback:[
        'Comprar legalmente una herramienta no justifica cada uso. La medida también debe ser necesaria, proporcional y supervisada.',
        'La presentación plantea supervisión independiente y revisión posterior. La reserva operativa no sustituye esos controles.',
        'La seguridad nacional no constituye una autorización ilimitada. La vigilancia necesita una finalidad concreta y controles efectivos.',
        'La presentación exige legalidad, necesidad y proporcionalidad, junto con una finalidad concreta y supervisión independiente.'
      ],hint:'Una finalidad de seguridad debe acompañarse de garantías sobre cómo se ejerce ese poder.',source:'Kaster y Ensign (2023); Raebisch (2024).'
    },
    {
      id:'q5',topic:'Analizar',slide:4,label:'El antecedente mexicano',
      question:'¿Qué motivó los cuestionamientos éticos sobre Pegasus en el caso de México?',
      options:[
        'La falta de herramientas para almacenar información gubernamental.',
        'El presunto uso contra periodistas, defensores de derechos humanos y figuras públicas.',
        'La obligación de divulgar públicamente todas las investigaciones en curso.',
        'El uso exclusivo de la herramienta para delitos graves bajo supervisión.'
      ],correct:1,
      feedback:[
        'El caso presentado trata del presunto uso inadecuado de vigilancia contra actores de la sociedad civil, no del almacenamiento institucional.',
        'La diapositiva señala cuestionamientos éticos por el presunto uso contra periodistas, defensores de derechos humanos y otras figuras públicas.',
        'La presentación cuestiona la falta de límites y controles efectivos. No atribuye el caso a una obligación de divulgar todas las investigaciones.',
        'Los cuestionamientos surgieron por el presunto uso contra actores de la sociedad civil. No se describen como consecuencia de un uso exclusivamente limitado y supervisado.'
      ],hint:'Recuerde qué personas aparecen como posibles objetivos en ese caso.',source:'Román Soltero et al. (2019).'
    },
    {
      id:'q6',topic:'Analizar',slide:4,label:'Más allá de un producto',
      question:'¿Qué idea refuerza la inclusión de Graphite, de Paragon, en la presentación?',
      options:[
        'Que las controversias de vigilancia se limitan a NSO Group.',
        'Que la existencia de otro proveedor elimina la necesidad de controles.',
        'Que los riesgos abarcan una industria con distintos proveedores.',
        'Que las instituciones democráticas quedan libres de estos riesgos.'
      ],correct:2,
      feedback:[
        'Graphite es un ejemplo de otro producto y proveedor. Su inclusión muestra que el problema excede a NSO Group.',
        'La existencia de varios proveedores refuerza la necesidad de regular las capacidades y sus usos en toda la industria.',
        'El caso de Graphite en Italia muestra que el mercado tiene varios proveedores. Por ello, los controles deben abarcar a la industria y no solo a un producto.',
        'La presentación utiliza casos europeos para mostrar que las democracias también enfrentan riesgos de vigilancia abusiva.'
      ],hint:'Piense en el alcance de una regulación centrada únicamente en una empresa.',source:'Hess et al. (2025).'
    },
    {
      id:'q7',topic:'Analizar',slide:5,label:'Personas que también quedan expuestas',
      question:'Si el teléfono de una periodista es comprometido, ¿por qué también pueden verse afectadas sus fuentes?',
      options:[
        'Porque la infección convierte automáticamente a sus contactos en objetivos legales.',
        'Porque la vigilancia impide que la periodista utilice cualquier medio de comunicación.',
        'Porque la protección de fuentes solo se aplica a conversaciones presenciales.',
        'Porque el acceso al teléfono puede revelar sus identidades y comunicaciones.'
      ],correct:3,
      feedback:[
        'La exposición de datos de terceros no equivale a convertir a esas personas en objetivos legales. El riesgo descrito es revelar sus identidades y comunicaciones.',
        'El riesgo central no es una prohibición automática de comunicarse, sino el acceso a información que permite identificar a las fuentes.',
        'La presentación trata la protección de fuentes como un derecho que también puede verse afectado por el acceso a comunicaciones digitales.',
        'El dispositivo contiene contactos y conversaciones. Su exposición puede identificar a las fuentes aunque estas no hayan sido seleccionadas como objetivos.'
      ],hint:'Considere qué información sobre otras personas conserva un teléfono.',source:'Di Salvo (2025); Raebisch (2024).'
    },
    {
      id:'q8',topic:'Analizar',slide:5,label:'El efecto sobre la libertad de expresión',
      question:'¿Qué significa que la sospecha de vigilancia puede producir un efecto inhibidor?',
      options:[
        'Que una persona puede evitar investigar o comunicar ciertos temas por temor.',
        'Que la sospecha por sí sola bloquea técnicamente las aplicaciones del teléfono.',
        'Que toda persona vigilada recibe una notificación antes del ataque.',
        'Que la vigilancia garantiza la confidencialidad de la labor periodística.'
      ],correct:0,
      feedback:[
        'La incertidumbre puede modificar conductas. Una persona puede dejar de investigar, comunicarse o abordar determinados temas por temor a la vigilancia.',
        'El efecto inhibidor describe un cambio de comportamiento por temor o incertidumbre. No significa que la sospecha bloquee aplicaciones.',
        'La vigilancia descrita puede operar en secreto. El efecto inhibidor no depende de recibir una notificación previa.',
        'La presentación señala el riesgo contrario: la vigilancia puede comprometer las fuentes y reducir la libertad de investigar y comunicar.'
      ],hint:'Se trata de un efecto sobre las decisiones y la conducta, no de una avería del dispositivo.',source:'Di Salvo (2025).'
    },
    {
      id:'q9',topic:'Decidir',slide:6,label:'Controles que acompañan a la vigilancia',
      question:'¿Cuál de estas medidas coincide con la supervisión propuesta en la presentación?',
      options:[
        'Conservar toda la información obtenida sin límites de tiempo.',
        'Permitir que el organismo operador revise únicamente sus propias actuaciones.',
        'Exigir autorización independiente, plazos, registros y revisión posterior.',
        'Dar por concluido el control cuando una empresa acepta vender la herramienta.'
      ],correct:2,
      feedback:[
        'La presentación incluye plazos y eliminación de información irrelevante. La conservación ilimitada contradice esos límites.',
        'La independencia de la supervisión es una garantía esencial. La revisión exclusiva por el operador no la sustituye.',
        'La autorización independiente debe acompañarse de límites temporales, registros de uso y revisión posterior. También se propone eliminar información irrelevante.',
        'Los controles abarcan compra, exportación y uso, además de investigación y reparación. La venta no concluye la supervisión.'
      ],hint:'Los controles deben permitir revisar la medida antes de utilizarla y después de su ejecución.',source:'Diapositiva 6: Supervisión y responsabilidad.'
    },
    {
      id:'q10',topic:'Decidir',slide:6,label:'Quién debe responder',
      question:'¿Qué dificulta atribuir responsabilidades por el uso de spyware?',
      options:[
        'La existencia de plazos y registros que permitan revisar las operaciones.',
        'La opacidad del mercado y la vigilancia que involucra distintas jurisdicciones.',
        'La intervención de autoridades independientes con capacidad de investigar.',
        'La posibilidad de que una víctima disponga de vías de reparación.'
      ],correct:1,
      feedback:[
        'Los plazos y registros ayudan a supervisar. La dificultad señalada es la opacidad del mercado y su dimensión transfronteriza.',
        'La presentación destaca que la opacidad del mercado y la vigilancia transfronteriza dificultan determinar responsabilidades.',
        'La investigación independiente forma parte de la respuesta propuesta, no de la dificultad central descrita.',
        'Las vías de reparación buscan que las víctimas puedan reclamar. Los obstáculos señalados son la opacidad y la dimensión transfronteriza.'
      ],hint:'La compra, el operador y la persona afectada pueden estar vinculados con países distintos.',source:'Gjesvik y Willers (2024); Wani et al. (2026); Anstis y Sprenger (2026).'
    }
  ];
