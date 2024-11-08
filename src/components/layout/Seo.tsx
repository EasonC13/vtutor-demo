// src/components/layout/Seo.tsx

import Head from "next/head";
import { useRouter } from "next/router";

const MetaTagsContainer = () => {
  const router = useRouter();
  const name = "VTutor";
  const description =
    "VTutor is an open-source Software Development Kit (SDK) designed to integrate Animated Pedagogical Agents (APAs) with generative AI capabilities into web applications.";
  const metadataImagePath = `https://vtutor.vercel.app/vtutor/VTutor_Landing.png`;
  const pathname = router.pathname;
  const page = pathname.split("/")[1] ?? "";
  const title = `${name} ${
    page &&
    page !== "" &&
    page !== null &&
    `| ${page.slice(0, 1).toUpperCase() + page.slice(1)}`
  }`;
  const TwiterUserName = "@VTutor_Tools";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <meta property="og:title" content={title} key="title" />
      <meta property="og:type" content="website" key="ogtype" />
      {metadataImagePath && (
        <meta property="og:image" content={metadataImagePath} key="ogimage" />
      )}

      <meta
        property="og:description"
        content={description}
        key="ogdescription"
      />
      <meta
        name="twitter:card"
        content={"summary_large_image"}
        key="twittercard"
      />
      <meta
        property="twitter:site"
        content={TwiterUserName}
        key="twittersite"
      />
      <meta property="twitter:title" content={title} key="twittertitle" />
      <meta
        property="twitter:description"
        content={description}
        key="twitterdescription"
      />
      <meta
        property="twitter:image"
        content={metadataImagePath}
        key="twitterimage"
      />
      {/* Favicon */}
      <link rel="shortcut icon" type="image/png" href="/favicon.png" />
    </Head>
  );
};

export default MetaTagsContainer;
