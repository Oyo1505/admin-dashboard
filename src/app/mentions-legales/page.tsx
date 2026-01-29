import Container from '@/domains/ui/components/container/container';

export const dynamic = 'force-static';

const Page = () => {
  return (
    <Container className="pt-14 flex flex-col gap-4">
      <h1 className="text-2xl">Mentions légales</h1>
      <p>
        <strong>En vigueur au 19/08/2024</strong>
      </p>

      <p>
        Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour
        la Confiance en l&apos;économie numérique, il est porté à la
        connaissance des utilisateurs et visiteurs, ci-après l&apos;
        <strong>&ldquo;Utilisateur&ldquo;</strong>, du site
        <a href="https://www.nuberubagu.fr/" target="_blank">
          https://www.nuberubagu.fr/
        </a>
        , ci-après le <strong>&ldquo;Site&ldquo;</strong>, les présentes
        mentions légales.
      </p>

      <p>
        La connexion et la navigation sur le Site par l&apos;Utilisateur
        implique acceptation intégrale et sans réserve des présentes mentions
        légales. Ces dernières sont accessibles sur le Site à la rubrique
        &ldquo;Mentions légales&ldquo;.
      </p>

      <h2>Édition du Site</h2>
      <p>
        L&apos;édition et la direction de la publication du Site est assurée par
        Monsieur Henri-Pierre RIGOULET, domicilié 80 Rue Marat 94200,
        Ivry-sur-Seine, France, et l&apos; adresse e-mail
        <a href="mailto:rigoulet.henri.pierre@gmail.com">
          rigoulet.henri.pierre@gmail.com
        </a>
        , ci-après l&apos;<strong>&ldquo;Éditeur&ldquo;</strong>.
      </p>

      <h2>Hébergeur</h2>
      <p>
        L&apos;hébergeur du Site est la société Vercel Inc., dont le siège
        social est situé au 340 S Lemon Ave #4133, 91789 Walnut.
      </p>

      <h2>Accès au Site</h2>
      <p>
        Le Site est normalement accessible, à tout moment, à l&apos;Utilisateur.
        Toutefois, l&apos;Éditeur pourra, à tout moment, suspendre, limiter ou
        interrompre le Site afin de procéder, notamment, à des mises à jour ou
        des modifications de son contenu. L&apos;Éditeur ne pourra en aucun cas
        être tenu responsable des conséquences éventuelles de cette
        indisponibilité sur les activités de l&ldquo;Utilisateur.
      </p>

      <h2>Collecte des données</h2>
      <p>
        Le Site assure à l&apos;Utilisateur une collecte et un traitement des
        données personnelles dans le respect de la vie privée conformément à la
        loi n°78-17 du 6 janvier 1978 relative à l&apos;informatique, aux
        fichiers aux libertés et dans le respect de la règlementation applicable
        en matière de traitement des données à caractère personnel conformément
        au règlement (UE) 2016/679 du Parlement européen et du Conseil du 27
        avril 2016 (ci-après, ensemble, la
        <strong>
          &ldquo;Règlementation applicable en matière de protection des Données
          à caractère personnel&ldquo;
        </strong>
        ).
      </p>

      <p>
        En vertu de la Règlementation applicable en matière de protection des
        Données à caractère personnel, l&apos;Utilisateur dispose d&apos;un
        droit d&apos;accès, de rectification, de suppression et
        d&apos;opposition de ses données personnelles. L&apos;Utilisateur peut
        exercer ce droit :
      </p>

      <ul>
        <li>
          par mail à l&apos;adresse e-mail
          <a href="mailto:rigoulet.henri.pierre@gmail.com">
            rigoulet.henri.pierre@gmail.com
          </a>
        </li>
      </ul>

      <p>
        Toute utilisation, reproduction, diffusion, commercialisation,
        modification de toute ou partie du Site, sans autorisation expresse de
        l&apos;Éditeur est prohibée et pourra entraîner des actions et
        poursuites judiciaires telles que prévues par la règlementation en
        vigueur.
      </p>
    </Container>
  );
};

export default Page;
