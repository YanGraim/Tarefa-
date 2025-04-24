import Head from "next/head";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./Task.module.css";
import { GetServerSideProps } from "next";
import { db } from "@/services/firebaseConnection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { TextArea } from "@/components/textarea";
import toast from "react-hot-toast";

interface TaskProps {
  item: {
    tarefa: string;
    publica: boolean;
    created: string;
    user: string;
    taskId: string;
  };
}

interface CommentsProps {
  id: string;
  name: string;
  user: string;
  taskId: string;
  comment: string;
}

export default function Task({ item }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) {
      toast.error("Digite algo válido");
      return;
    }

    if (!session?.user?.email || !session?.user?.name) {
      toast.error("Nome do usuário ou email inválido");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      });
      setInput("");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>

        <form onSubmit={handleComment}>
          <TextArea
            placeholder="Digite seu comentario"
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
          />
          <button className={styles.button} disabled={!session?.user}>
            Enviar comentário
          </button>
        </form>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tasks", id);
  const snapshot = await getDoc(docRef);

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);
  const allComments: CommentsProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      user: doc.data().user,
      comment: doc.data().comment,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.publica) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    tarefa: snapshot.data()?.tarefa,
    publica: snapshot.data()?.publica,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  // console.log(task)

  return {
    props: {
      item: task,
    },
  };
};
