import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState } from "react";
import styles from "@/pages/dashboard/Dashboard.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { TextArea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "@/services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";

interface HomeProps {
  user: {
    email: string;
  }
}

export default function Dashboard({ user }: HomeProps) {
  const [input, setInput] = useState("")
  const [publicTask, setPublicTask] = useState(false)

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked)
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault()

    if (!input.trim()) {
      toast.error("Digite algo válido")
      return
    }

    try {
      await addDoc(collection(db, "tasks"), {
        tarefa: input,
        created: new Date(),
        user: "",
        publica: publicTask
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>

            <form onSubmit={handleRegisterTask}>
              <TextArea
                placeholder="Digite sua tarefa..."
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
              />
              <div className={styles.checkBoxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa publica?</label>
              </div>
              <button type="submit" className={styles.button}>Registrar</button>
            </form>
          </div>
        </section>
        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          <article className={styles.task}>
            <div className={styles.tagContainer}>
              <label className={styles.tag}>PUBLICA</label>
              <button className={styles.shareButton}>
                <FiShare2 size={20} color="#3183ff" />
              </button>
            </div>
            <div className={styles.taskContent}>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolor, tempora provide
              </p>
              <button className={styles.trash}>
                <FaTrash size={24} color="#ea3140" />
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}


export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req })
  // console.log(session)
  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      }
    }
  }
  return {
    props: {
      user: {
        email: session?.user?.email
      }
    }
  }
}