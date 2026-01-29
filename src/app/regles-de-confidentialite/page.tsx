import Container from '@/domains/ui/components/container/container';

export const dynamic = 'force-static';

const Page = () => {
  return (
    <Container className="pt-14">
      <div className="flex flex-col gap-5">
        <h1>Règles de Confidentialité</h1>

        <p>
          <strong>Date de dernière mise à jour :</strong> 17/08/2024
        </p>

        <h2>Introduction</h2>
        <p>
          Bienvenue sur <strong>https://www.nuberubagu.fr/</strong>. Nous
          accordons une grande importance à la protection de votre vie privée et
          nous nous engageons à protéger les informations personnelles que vous
          nous fournissez en ligne. Cette politique de confidentialité décrit
          comment nous collectons, utilisons, divulguons et protégeons vos
          informations personnelles.
        </p>

        <h2>Informations que nous collectons</h2>
        <p>
          Nous pouvons collecter les types d&apos;informations suivants lorsque
          vous utilisez notre site :
        </p>
        <ul>
          <li>
            <strong>Informations personnelles :</strong> telles que votre nom,
            adresse e-mail que vous nous fournissez directement en remplissant
            des formulaires sur notre site ou en utilisant des services
            d&apos;authentification tiers tels que Google.
          </li>
          <li>
            <strong>Données de navigation :</strong> y compris l&apos;adresse
            IP, le type de navigateur, les pages consultées, la durée des
            visites, et d&apos;autres données de connexion.
          </li>
          <li>
            <strong>Cookies :</strong> nous utilisons des cookies pour améliorer
            votre expérience sur notre site, analyser le trafic, et
            personnaliser le contenu.
          </li>
        </ul>

        <h2>Authentification Google</h2>
        <p>
          Lorsque vous utilisez l&apos;authentification Google pour vous
          connecter à notre site, nous collectons et utilisons certaines
          informations de votre compte Google, telles que votre nom, votre
          adresse e-mail et votre photo de profil. Cette méthode
          d&apos;authentification vous permet de vous connecter à notre site
          sans avoir à créer un compte spécifique.
        </p>
        <p>
          Les informations que nous recevons de Google dépendent des paramètres
          de votre compte Google. Nous vous encourageons à consulter la
          <a
            className="font-bold"
            href="https://policies.google.com/privacy?hl=fr"
            target="_blank"
          >
            politique de confidentialité de Google
          </a>
          pour comprendre comment vos informations personnelles sont collectées
          et utilisées par Google.
        </p>

        <h2>Comment nous utilisons vos informations</h2>
        <p>
          Nous utilisons les informations collectées pour les finalités
          suivantes :
        </p>
        <ul>
          <li>
            <strong>Fournir et améliorer nos services :</strong> pour traiter
            vos demandes, personnaliser votre expérience, et améliorer la
            qualité de notre site.
          </li>
          <li>
            <strong>Communication :</strong> pour vous envoyer des informations
            sur nos services, promotions, ou mises à jour importantes.
          </li>
          <li>
            <strong>Analyse :</strong> pour comprendre les tendances
            d&apos;utilisation et améliorer nos services.
          </li>
        </ul>

        <h2>Partage de vos informations</h2>
        <p>
          Nous ne vendons, n&apos;échangeons, ni ne louons vos informations
          personnelles à des tiers. Cependant, nous pouvons partager vos
          informations avec des tiers dans les situations suivantes :
        </p>
        <ul>
          <li>
            <strong>Fournisseurs de services :</strong> des tiers qui
            fournissent des services en notre nom, tels que l&apos;hébergement,
            l&apos;analyse de données, et le marketing, sous réserve qu&apos;ils
            acceptent de protéger ces informations.
          </li>
          <li>
            <strong>Obligations légales :</strong> si la loi l&apos;exige, ou
            pour répondre à des demandes gouvernementales légitimes, nous
            pouvons divulguer vos informations.
          </li>
        </ul>

        <h2>Sécurité de vos informations</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité raisonnables pour
          protéger vos informations personnelles contre l&apos;accès non
          autorisé, l&apos;altération, la divulgation ou la destruction.
        </p>

        <h2>Vos droits</h2>
        <p>Vous avez le droit de :</p>
        <ul>
          <li>
            <strong>Accéder à vos données :</strong> demander une copie des
            informations que nous détenons sur vous.
          </li>
          <li>
            <strong>Rectifier vos données :</strong> corriger toute inexactitude
            dans vos informations personnelles.
          </li>
          <li>
            <strong>Supprimer vos données :</strong> demander la suppression de
            vos informations personnelles de nos dossiers, sous certaines
            conditions.
          </li>
        </ul>

        <h2>Modifications de cette politique</h2>
        <p>
          Nous pouvons mettre à jour cette politique de confidentialité de temps
          à autre. Toute modification sera publiée sur cette page avec la date
          de révision mise à jour.
        </p>

        <h2>Nous contacter</h2>
        <p>
          Si vous avez des questions concernant cette politique de
          confidentialité, veuillez nous contacter à :
        </p>
        <address>
          <a href="mailto:rigoulet.henri.pierre@gmail.com">
            rigoulet.henri.pierre@gmail.com
          </a>
        </address>
      </div>
    </Container>
  );
};

export default Page;
