import type { IconName } from "@/components/icons";
import type { AvailableLocale } from "@/i18n/locales";

/**
 * Privacy policy copy. design.md §5.10
 *
 * Kept out of i18n/messages/*.ts: this is a long-form legal document, and
 * threading a hundred keys through the dictionary makes both files unreadable.
 * Same ar/fr pair, same shape, checked by the type.
 *
 * Everything here is derived from the code, not written from a template. The
 * field lists come from the insert payloads in src/actions/*.ts, the cookies
 * from src/proxy.ts and the Supabase middleware, the analytics from
 * components/analytics/google-analytics.tsx and @vercel/analytics in the root
 * layout, and the public directories from the get_public_* RPCs in
 * lib/data/public.ts. If a form gains a field, this page is part of the change.
 */
export type PrivacySection = {
  id: string;
  icon: IconName;
  title: string;
  paragraphs?: string[];
  items?: { term: string; detail: string }[];
  /** Rendered as a bordered call-out under the section. */
  callout?: string;
};

export type PrivacyContent = {
  eyebrow: string;
  title: string;
  lede: string;
  updated: string;
  tocTitle: string;
  sections: PrivacySection[];
};

const ar: PrivacyContent = {
  eyebrow: "سياسة الخصوصية وحماية البيانات",
  title: "كيف نتعامل مع بياناتكم",
  lede: "هذه الصفحة تشرح، بالتفصيل وبلا تعميم، ما الذي نجمعه عندما تسجّلون على المنصة، ولماذا، ومن يطّلع عليه، وكيف تطلبون حذفه.",
  updated: "آخر تحديث: 4 سبتمبر 2026",
  tocTitle: "محتوى الصفحة",
  sections: [
    {
      id: "scope",
      icon: "shield-01",
      title: "من نحن وما الذي تغطيه هذه السياسة",
      paragraphs: [
        "«هبة الجزائر» مبادرة رقمية مستقلة لتنسيق التضامن، غير حكومية وغير تابعة لأي جهة رسمية، ولا تجمع أموالًا.",
        "تغطي هذه السياسة موقع المنصة وتطبيقَيها على App Store و Google Play. التطبيقان يعرضان المحتوى نفسه، وما يُسجَّل فيهما يُسجَّل في القاعدة نفسها ويخضع للقواعد نفسها الموصوفة هنا.",
      ],
    },
    {
      id: "collect",
      icon: "list-view",
      title: "ما الذي نجمعه بالضبط",
      paragraphs: [
        "لا نطلب أي بيانات إلا ما تكتبونه بأنفسكم في أحد النماذج. لا يوجد تسجيل حساب ولا كلمة مرور للزوار، ولا نشتري بيانات من أي طرف.",
      ],
      items: [
        {
          term: "طلب مساعدة لعائلة متضررة",
          detail:
            "الاسم الكامل، رقم الهاتف، الولاية والبلدية، وصف العنوان، عدد أفراد الأسرة وعدد الأطفال، حالة السكن وهل هو صالح للسكن، وجود إصابات ووصفها، الحاجة إلى رعاية طبية ووصفها، فقدان الدخل أو الماشية، ونوع المساعدات المطلوبة.",
        },
        {
          term: "تقييم أضرار السكن",
          detail:
            "الاسم ورقم الهاتف والموقع، نوع الأضرار (سقف، سباكة، كهرباء، أرضيات، دهن)، المساحات والكميات التقديرية، وصور للمنزل المتضرر إن أرفقتموها.",
        },
        {
          term: "تقديم مساعدات عينية",
          detail:
            "اسم المتبرّع ورقم هاتفه، الولاية والبلدية الحالية، نوع المواد وكمياتها ووحدتها، تاريخ الجاهزية، وهل تستطيعون الإيصال بأنفسكم أو تحتاجون نقلًا.",
        },
        {
          term: "التطوع الميداني",
          detail:
            "الاسم ورقم الهاتف، الولاية والبلدية، المهارات، أوقات التفرغ، إمكانية التنقل، العتاد المتوفر، رقم شخص للطوارئ، واختياركم لظهور رقمكم علنًا من عدمه.",
        },
        {
          term: "التطوع الطبي والبيطري",
          detail:
            "ما سبق، إضافة إلى البريد الإلكتروني، التخصص، رقم الاعتماد أو بطاقة المهنة، مقر العمل، والاستعداد للتدخل الميداني أو الاستشارة الهاتفية.",
        },
        {
          term: "التطوع الحرفي",
          detail: "الاسم والهاتف والموقع، التخصص الحرفي، امتلاك العتاد، والاستعداد للتنقل.",
        },
        {
          term: "عروض النقل",
          detail:
            "اسم السائق ورقم هاتفه، ولاية الانطلاق والوجهة، نوع المركبة والحمولة، تاريخ الرحلة والتوقيت المفضل، وملاحظات المسار.",
        },
      ],
    },
    {
      id: "sensitive",
      icon: "medicine-02",
      title: "البيانات الحسّاسة",
      paragraphs: [
        "نقولها صراحةً: نموذج طلب المساعدة قد يتضمن معلومات صحية — وجود إصابات ووصفها، والحاجة إلى رعاية طبية — كما قد يتضمن نموذج تقييم الأضرار صورًا لمنزلكم. هذه أكثر ما نستقبله حساسية.",
        "لا تظهر هذه المعلومات علنًا على المنصة في أي حال، ولا تدخل في أي قائمة أو دليل عام. يطّلع عليها فقط منسّقو الإغاثة أصحاب الحسابات، وتُشارَك مع الجهات الرسمية المكلّفة بالتدخل.",
        "لا تكتبوا في خانات الملاحظات أكثر مما تحتاجه فرق الإغاثة فعلًا للوصول إليكم ومساعدتكم.",
      ],
    },
    {
      id: "why",
      icon: "sent",
      title: "لماذا نجمعها",
      paragraphs: [
        "لغرض واحد: توجيه المساعدة إلى المكان والشخص الصحيحين في الوقت الصحيح. الاسم والهاتف ليُتَّصل بكم، والولاية والبلدية والعنوان لتُحدَّد وجهة القافلة، وعدد الأسرة وحالة السكن والإصابات لترتيب الأولويات بين الطلبات.",
        "لا نستعمل بياناتكم لأي غرض تجاري أو إعلاني، ولا لبناء ملفات عن الأشخاص، ولا لأي شيء خارج تنسيق الإغاثة.",
      ],
    },
    {
      id: "who",
      icon: "user-multiple",
      title: "من يطّلع عليها",
      items: [
        {
          term: "منسّقو المنصة",
          detail:
            "فريق التنسيق الذي يملك حسابات على لوحة الإدارة، وهم من يعالجون الطلبات ويطابقونها بالمساعدات المتوفرة.",
        },
        {
          term: "الجهات الرسمية المكلّفة بالإغاثة",
          detail:
            "الحماية المدنية، السلطات المحلية، وخلايا التنسيق المعتمدة — لتنظيم التدخل ومعرفة أين تصل الإغاثة أولًا.",
        },
      ],
      callout:
        "لا نبيع البيانات، ولا نشاركها مع معلنين أو وسطاء بيانات أو أي طرف ثالث آخر، ولا نستعملها لأي غرض تجاري.",
    },
    {
      id: "public",
      icon: "news",
      title: "ما الذي يظهر علنًا",
      paragraphs: [
        "الأصل أن ما تسجّلونه لا يظهر علنًا. الاستثناء الوحيد هو الأدلة التطوعية: عند التسجيل كمتطوع ميداني أو طبي أو بيطري تُسألون صراحةً إن كنتم توافقون على ظهور رقمكم في الدليل العام. إن لم توافقوا، لا يظهر.",
        "أما مراكز الاستقبال ونقاط التجميع والاحتياجات المعروضة على الخريطة وصفحة الاحتياجات، فهي بيانات مؤسسات ومواقع عمل ينشرها فريق التنسيق، وليست بيانات أسر.",
        "طلبات المساعدة وتقييمات الأضرار والتبرعات لا تُنشر علنًا إطلاقًا.",
      ],
    },
    {
      id: "cookies",
      icon: "layers-01",
      title: "الكوكيز والقياس",
      items: [
        {
          term: "NEXT_LOCALE",
          detail: "لغة العرض التي اخترتموها، لمدة سنة. تفضيل شخصي لا أكثر.",
        },
        {
          term: "كوكي الجلسة",
          detail: "لحسابات فريق التنسيق فقط، لإبقاء الجلسة مفتوحة داخل لوحة الإدارة. لا يُنشأ للزوار.",
        },
        {
          term: "تخزين محلي",
          detail:
            "علامة واحدة في متصفحكم تسجّل أنكم رأيتم نافذة الترحيب، حتى لا تُعرض في كل زيارة. لا تغادر جهازكم.",
        },
        {
          term: "قياس الزيارات",
          detail:
            "Vercel Analytics لعدّ الصفحات الأكثر زيارة. وإن فُعِّل Google Analytics فهو مضبوط على رفض إشارات الإعلانات، ولا يعمل إطلاقًا داخل لوحة الإدارة حيث تُعرض بيانات الأسر.",
        },
      ],
    },
    {
      id: "third-parties",
      icon: "link-square-02",
      title: "خدمات يتصل بها جهازكم",
      items: [
        {
          term: "OpenStreetMap",
          detail:
            "خرائط المنصة تُحمَّل من خوادم OpenStreetMap، فيصلها عنوان IP الخاص بكم كما في أي طلب على الإنترنت. لا نرسل إليها أي شيء عن هويتكم.",
        },
        {
          term: "خرائط Google",
          detail:
            "زر «الاتجاهات» يفتح خرائط Google في نافذة جديدة. لا يحدث ذلك إلا إذا ضغطتم عليه، وعندها تنتقلون إلى خدمة تحكمها سياسة Google.",
        },
        {
          term: "متاجر التطبيقات",
          detail:
            "روابط تحميل التطبيق في التذييل تنقلكم إلى App Store أو Google Play إن ضغطتم عليها، فتسري عندها سياسة Apple أو Google. لا يحدث أي توجيه تلقائي: تصفّح الموقع من الهاتف يبقى على الموقع.",
        },
      ],
    },
    {
      id: "location",
      icon: "location-01",
      title: "الموقع الجغرافي",
      paragraphs: [
        "زر «تحديد موقعي» في الخريطة يطلب إذن المتصفح ويستعمل الإحداثيات لتوسيط الخريطة على شاشتكم فقط. لا تُرسَل إلى خوادمنا ولا تُخزَّن ولا تُربَط بأي تسجيل.",
        "الموقع الذي نحتفظ به هو ما تكتبونه أنتم في النموذج: الولاية والبلدية ووصف العنوان.",
      ],
    },
    {
      id: "retention",
      icon: "clock-01",
      title: "مدة الاحتفاظ",
      paragraphs: [
        "نحتفظ بالتسجيلات ما دامت حملة الإغاثة الجارية تحتاجها لمتابعة الطلبات والتوزيع والتدقيق فيما وصل فعلًا.",
        "يمكنكم طلب الحذف في أي وقت، ونُنفّذه ما لم يمنعنا التزام قانوني. عند الحذف تُزال الصور المرفقة كذلك.",
      ],
    },
    {
      id: "rights",
      icon: "user-check-01",
      title: "حقوقكم وكيف تمارسونها",
      paragraphs: [
        "لكم أن تطلبوا الاطّلاع على ما سجّلناه عنكم، أو تصحيحه، أو حذفه، أو سحب موافقتكم على ظهور رقمكم في الدليل العام.",
        "الطلبات تُفتح حاليًا عبر مستودع المنصة العلني على GitHub.",
      ],
      callout:
        "المستودع علني: لا تكتبوا في الطلب اسمكم الكامل ولا رقم هاتفكم ولا عنوانكم. يكفي أن تذكروا أي نموذج استعملتم وتاريخه تقريبًا والولاية، وسيتواصل معكم فريق التنسيق عبر القناة التي سجّلتم بها.",
    },
    {
      id: "security",
      icon: "shield-user",
      title: "الحماية",
      paragraphs: [
        "الاتصال بالموقع مشفَّر. الوصول إلى بيانات الأسر محصور في حسابات فريق التنسيق، وتفرضه قواعد صلاحيات على مستوى قاعدة البيانات لا على مستوى الواجهة وحدها.",
        "كود المنصة مفتوح ويمكن مراجعته من أي شخص — وهذا في ذاته ضمانة: ما نقوله هنا قابل للتحقق منه في الكود.",
      ],
    },
    {
      id: "children",
      icon: "user-group",
      title: "الأطفال",
      paragraphs: [
        "المنصة موجّهة للبالغين. نطلب عدد الأطفال في الأسرة لأن ذلك يحدد أولوية المساعدة ونوعها (حليب، حفاضات، أفرشة)، لكننا لا نطلب أسماءهم ولا أي بيانات تخصّهم، ولا نتوجّه إليهم بالتسجيل.",
      ],
    },
    {
      id: "changes",
      icon: "refresh",
      title: "تعديل هذه السياسة",
      paragraphs: [
        "إن تغيّر ما نجمعه أو من نشاركه، نُحدّث هذه الصفحة ونغيّر تاريخ آخر تحديث أعلاها. تاريخ كل تعديل مسجَّل في سجل المستودع العلني.",
      ],
    },
  ],
};

const fr: PrivacyContent = {
  eyebrow: "Politique de confidentialité et protection des données",
  title: "Comment nous traitons vos données",
  lede: "Cette page explique en détail, sans formule vague, ce que nous recueillons quand vous vous enregistrez sur la plateforme, pourquoi, qui y a accès, et comment en demander la suppression.",
  updated: "Dernière mise à jour : 4 septembre 2026",
  tocTitle: "Sommaire",
  sections: [
    {
      id: "scope",
      icon: "shield-01",
      title: "Qui nous sommes et ce que couvre cette politique",
      paragraphs: [
        "« Hiba El Djazair » est une initiative numérique indépendante de coordination de la solidarité : non gouvernementale, sans affiliation officielle, et qui ne collecte pas d'argent.",
        "Cette politique couvre le site de la plateforme et ses applications sur l'App Store et Google Play. Les applications présentent le même contenu ; ce qui y est enregistré l'est dans la même base et suit exactement les règles décrites ici.",
      ],
    },
    {
      id: "collect",
      icon: "list-view",
      title: "Ce que nous recueillons, précisément",
      paragraphs: [
        "Nous ne recueillons que ce que vous saisissez vous-même dans un formulaire. Il n'y a ni compte ni mot de passe pour les visiteurs, et nous n'achetons de données à personne.",
      ],
      items: [
        {
          term: "Demande d'aide (famille sinistrée)",
          detail:
            "Nom complet, téléphone, wilaya et commune, description de l'adresse, taille du foyer et nombre d'enfants, état du logement et son habitabilité, présence de blessés et leur description, besoin de soins médicaux et sa description, perte de revenus ou de bétail, et types d'aide demandés.",
        },
        {
          term: "Évaluation des dégâts du logement",
          detail:
            "Nom, téléphone et localisation, nature des dégâts (toiture, plomberie, électricité, sols, peinture), surfaces et quantités estimées, et les photos du logement si vous en joignez.",
        },
        {
          term: "Don de matériel",
          detail:
            "Nom du donateur et téléphone, wilaya et commune actuelles, nature des articles, quantité et unité, date de disponibilité, et si vous pouvez livrer vous-même ou avez besoin d'un transport.",
        },
        {
          term: "Volontariat de terrain",
          detail:
            "Nom et téléphone, wilaya et commune, compétences, disponibilités, capacité de déplacement, équipement, contact d'urgence, et votre choix d'afficher ou non votre numéro publiquement.",
        },
        {
          term: "Volontariat médical et vétérinaire",
          detail:
            "Ce qui précède, plus l'adresse e-mail, la spécialité, le numéro d'agrément ou de carte professionnelle, le lieu d'exercice, et la disponibilité pour le terrain ou la téléconsultation.",
        },
        {
          term: "Volontariat artisanal",
          detail:
            "Nom, téléphone et localisation, spécialité artisanale, possession d'outillage, et disponibilité au déplacement.",
        },
        {
          term: "Offre de transport",
          detail:
            "Nom du conducteur et téléphone, wilaya de départ et de destination, type de véhicule et capacité, date et créneau du trajet, et remarques sur l'itinéraire.",
        },
      ],
    },
    {
      id: "sensitive",
      icon: "medicine-02",
      title: "Données sensibles",
      paragraphs: [
        "Nous le disons franchement : le formulaire de demande d'aide peut contenir des informations de santé — présence de blessés et leur description, besoin de soins — et le formulaire d'évaluation des dégâts peut contenir des photos de votre logement. C'est ce que nous recevons de plus sensible.",
        "Ces informations n'apparaissent jamais publiquement sur la plateforme et ne figurent dans aucun annuaire. Seuls les coordinateurs disposant d'un compte y accèdent, et elles sont transmises aux organismes officiels chargés de l'intervention.",
        "N'écrivez dans les champs de remarques que ce dont les équipes de secours ont réellement besoin pour vous joindre et vous aider.",
      ],
    },
    {
      id: "why",
      icon: "sent",
      title: "Pourquoi nous les recueillons",
      paragraphs: [
        "Pour une seule raison : acheminer l'aide au bon endroit, à la bonne personne, au bon moment. Le nom et le téléphone pour vous joindre ; la wilaya, la commune et l'adresse pour orienter le convoi ; la taille du foyer, l'état du logement et les blessures pour établir les priorités entre les demandes.",
        "Vos données ne servent à aucune fin commerciale ou publicitaire, ne servent pas à constituer des profils, et ne servent à rien en dehors de la coordination des secours.",
      ],
    },
    {
      id: "who",
      icon: "user-multiple",
      title: "Qui y a accès",
      items: [
        {
          term: "Les coordinateurs de la plateforme",
          detail:
            "L'équipe de coordination disposant d'un compte sur l'espace d'administration, qui traite les demandes et les met en correspondance avec les dons disponibles.",
        },
        {
          term: "Les organismes officiels chargés des secours",
          detail:
            "Protection Civile, autorités locales et cellules de coordination agréées — pour organiser l'intervention et savoir où l'aide doit arriver en premier.",
        },
      ],
      callout:
        "Nous ne vendons pas ces données, ne les partageons ni avec des annonceurs, ni avec des courtiers en données, ni avec aucun autre tiers, et ne les utilisons à aucune fin commerciale.",
    },
    {
      id: "public",
      icon: "news",
      title: "Ce qui apparaît publiquement",
      paragraphs: [
        "Par défaut, ce que vous enregistrez n'est pas public. La seule exception est celle des annuaires de bénévoles : en vous inscrivant comme bénévole de terrain, médical ou vétérinaire, il vous est explicitement demandé si vous acceptez que votre numéro figure dans l'annuaire public. Sans votre accord, il n'y figure pas.",
        "Les centres d'accueil, les points de collecte et les besoins affichés sur la carte et la page des besoins sont des données d'organisations et de lieux d'intervention, publiées par l'équipe de coordination — ce ne sont pas des données de familles.",
        "Les demandes d'aide, les évaluations de dégâts et les dons ne sont jamais publiés.",
      ],
    },
    {
      id: "cookies",
      icon: "layers-01",
      title: "Cookies et mesure d'audience",
      items: [
        {
          term: "NEXT_LOCALE",
          detail: "La langue d'affichage que vous avez choisie, pour un an. Une simple préférence.",
        },
        {
          term: "Cookie de session",
          detail:
            "Uniquement pour les comptes de l'équipe de coordination, afin de maintenir la session dans l'espace d'administration. Aucun n'est créé pour les visiteurs.",
        },
        {
          term: "Stockage local",
          detail:
            "Un seul marqueur dans votre navigateur retenant que vous avez vu la fenêtre d'accueil, pour ne pas la réafficher à chaque visite. Il ne quitte pas votre appareil.",
        },
        {
          term: "Mesure d'audience",
          detail:
            "Vercel Analytics pour compter les pages les plus consultées. Si Google Analytics est activé, il est configuré pour refuser les signaux publicitaires et ne se charge jamais dans l'espace d'administration où sont affichées les données des familles.",
        },
      ],
    },
    {
      id: "third-parties",
      icon: "link-square-02",
      title: "Services contactés par votre appareil",
      items: [
        {
          term: "OpenStreetMap",
          detail:
            "Les fonds de carte proviennent des serveurs d'OpenStreetMap, qui reçoivent donc votre adresse IP comme pour toute requête sur Internet. Nous ne leur transmettons rien sur votre identité.",
        },
        {
          term: "Google Maps",
          detail:
            "Le bouton « Itinéraire » ouvre Google Maps dans un nouvel onglet. Cela n'arrive que si vous cliquez dessus ; vous quittez alors la plateforme pour un service régi par la politique de Google.",
        },
        {
          term: "Boutiques d'applications",
          detail:
            "Les liens de téléchargement en pied de page mènent à l'App Store ou à Google Play si vous cliquez dessus ; la politique d'Apple ou de Google s'applique alors. Aucune redirection automatique n'a lieu : naviguer sur le site depuis un mobile vous laisse sur le site.",
        },
      ],
    },
    {
      id: "location",
      icon: "location-01",
      title: "Position géographique",
      paragraphs: [
        "Le bouton « Ma position » de la carte demande l'autorisation du navigateur et utilise les coordonnées uniquement pour centrer la carte sur votre écran. Elles ne sont ni envoyées à nos serveurs, ni conservées, ni rattachées à un enregistrement.",
        "La seule localisation que nous conservons est celle que vous saisissez : wilaya, commune et description de l'adresse.",
      ],
    },
    {
      id: "retention",
      icon: "clock-01",
      title: "Durée de conservation",
      paragraphs: [
        "Nous conservons les enregistrements aussi longtemps que la campagne de secours en cours en a besoin pour suivre les demandes, la distribution et vérifier ce qui est réellement parvenu.",
        "Vous pouvez demander la suppression à tout moment ; nous l'appliquons sauf obligation légale contraire. Les photos jointes sont supprimées avec l'enregistrement.",
      ],
    },
    {
      id: "rights",
      icon: "user-check-01",
      title: "Vos droits et comment les exercer",
      paragraphs: [
        "Vous pouvez demander à consulter ce que nous avons enregistré à votre sujet, à le corriger, à le supprimer, ou à retirer votre accord à la publication de votre numéro dans l'annuaire.",
        "Les demandes se font actuellement via le dépôt public de la plateforme sur GitHub.",
      ],
      callout:
        "Le dépôt est public : n'y écrivez ni votre nom complet, ni votre numéro, ni votre adresse. Indiquez seulement quel formulaire vous avez utilisé, sa date approximative et la wilaya ; l'équipe de coordination vous recontactera par le canal avec lequel vous vous êtes enregistré.",
    },
    {
      id: "security",
      icon: "shield-user",
      title: "Sécurité",
      paragraphs: [
        "La connexion au site est chiffrée. L'accès aux données des familles est réservé aux comptes de l'équipe de coordination et imposé par des règles d'autorisation au niveau de la base de données, pas seulement au niveau de l'interface.",
        "Le code de la plateforme est ouvert et consultable par quiconque — ce qui est en soi une garantie : ce que nous affirmons ici est vérifiable dans le code.",
      ],
    },
    {
      id: "children",
      icon: "user-group",
      title: "Les enfants",
      paragraphs: [
        "La plateforme s'adresse aux adultes. Nous demandons le nombre d'enfants du foyer parce qu'il détermine la priorité et la nature de l'aide (lait, couches, couvertures), mais nous ne demandons ni leurs noms ni aucune donnée les concernant, et nous ne sollicitons pas leur inscription.",
      ],
    },
    {
      id: "changes",
      icon: "refresh",
      title: "Modification de cette politique",
      paragraphs: [
        "Si ce que nous recueillons ou avec qui nous le partageons change, cette page est mise à jour et la date en tête est modifiée. L'historique de chaque modification figure dans le dépôt public.",
      ],
    },
  ],
};

export const privacyContent: Record<AvailableLocale, PrivacyContent> = { ar, fr };
