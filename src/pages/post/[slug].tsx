import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import {FiCalendar,FiUser,FiClock} from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { formatDate } from '../../utils/formatDate';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {
  const router = useRouter()

  const readingTime = post.data.content.reduce((acc,currentValue)=>{
    const textBody = RichText.asText(currentValue.body)
    const wordBody = textBody.split(" ")
    const number_words = wordBody.length

    const result = Math.ceil(number_words / 200);
    return acc + result;

  },0)


  if (router.isFallback) {
    return <div>Carregando...</div>
  }
  return(
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <main className={styles.container}>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="" />
        </div>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time>
              <FiCalendar />
              {formatDate(post.first_publication_date)}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <time>
              <FiClock />
              {readingTime} min
            </time>
          </div>
          {post.data.content.map(section=>(
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <div dangerouslySetInnerHTML={{
                __html:RichText.asHtml(section.body)
                }}
              />
            </section>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type','posts')
  ],{
    fetch:['posts.title','posts.subtitle','posts.author'],
    pageSize:2
  })

  const paths = posts.results.map(post =>({
    params: { slug: post.uid }
  }))

  return{
    paths,
    fallback:true
  }
};

export const getStaticProps:GetStaticProps = async ({params}) => {
  const { slug } = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts',String(slug),{});

  
  
  const post = {
    uid:response.uid,
    first_publication_date:response.first_publication_date,
    data:{
      title:response.data.title,
      subtitle:response.data.subtitle,
      author:response.data.author,
      banner:{
        url:response.data.banner.url,
      },
      content: response.data.content.map(con => {
        return{
          heading:con.heading,
          body: con.body,
        }
      })
    }
  }

  return{
    props:{
      post
    }
  }
  // TODO
};
