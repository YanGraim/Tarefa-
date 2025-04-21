import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import HeroImg from "../../public/assets/hero.png";

export default function Home() {
  return (
    <>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            src={HeroImg}
            alt="Logo Tarefas+"
            priority
            className={styles.hero}
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>
      </main>
    </>
  );
}
