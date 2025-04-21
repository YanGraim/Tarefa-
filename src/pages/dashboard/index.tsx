import styles from "@/pages/dashboard/Dashboard.module.css";
import Head from "next/head";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <h1>Pagina painel</h1>
    </div>
  );
}
