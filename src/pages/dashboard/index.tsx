import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styles from "@/pages/dashboard/Dashboard.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { TextArea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { db } from "@/services/firebaseConnection";
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

interface HomeProps {
  user: {
    email: string;
  }
}

interface TaskProps {
  id: string;
  created: Date;
  publica: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: HomeProps) {
  const [input, setInput] = useState("")
  const [publicTask, setPublicTask] = useState(false)
  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {
    async function loadTarefas() {
      const tarefasRef = collection(db, "tasks");
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      )

      onSnapshot(q, (snapshot) => {
        const lista = [] as TaskProps[];

        snapshot.forEach((doc) => {
          const { tarefa, created, user, publica } = doc.data();
          lista.push({
            id: doc.id,
            tarefa,
            created,
            user,
            publica
          })
        })

        setTasks(lista)
      })
    }

    loadTarefas();
  }, [user?.email])

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
        user: user?.email,
        publica: publicTask
      });
      toast.success("Tarefa registrada com sucesso")
      setInput("")
      setPublicTask(false)
    } catch (error) {
      console.log(error)
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`)
    toast.success("URL copiada com sucesso")
  }

  async function handleDelete(id: string) {
    const docRef = doc(db, "tasks", id)
    await deleteDoc(docRef)
    toast.success("Tarefa deletada com sucesso")
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
          {tasks.map((item) => (
            <article className={styles.task} key={item.id}>
              {item.publica && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICA</label>
                  <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                    <FiShare2 size={20} color="#3183ff" />
                  </button>
                </div>
              )}
              <div className={styles.taskContent}>
                {item.publica ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}
                <button className={styles.trash} onClick={() => handleDelete(item.id)}>
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
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