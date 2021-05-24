import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';

import {FiCalendar,FiUser} from 'react-icons/fi'
import { useState } from 'react';
import { formatDate } from '../utils/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}:HomeProps) {
  // TODO
  const [posts,setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPageUrl,setNextPageUrl] = useState(postsPagination.next_page)

  async function loadMore(){
    fetch(nextPageUrl)
    .then(response => response.json())
    .then(data => {
      const newsPosts = data.results.map(post => ({
        uid: post.uid,
        first_publication_date:post.first_publication_date,
        data:post.data
      }))

      setPosts([...posts,...newsPosts])
      setNextPageUrl(data.next_page)
      
    })
  }

  return(
    <>
      <Head>
          <title>Home | spacetraveling</title>
      </Head>
      
      <main className={styles.contentContainer}>
        <img src="/logo.svg" alt="logo"/>
        <div className={styles.posts}>
          {posts.map(post=>(
            <Link key={post?.uid} href={`/post/${post?.uid}`}>
              <a>
                <strong>{post?.data.title}</strong>
                <p>{post?.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar/>
                    {formatDate(post.first_publication_date)}
                  </time>
                  <span>
                    <FiUser />
                    {post?.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
          
        </div>
        {nextPageUrl && (
          <button onClick={loadMore} className={styles.loadMore}>
            Carregar mais posts
          </button>
        )}
        
      </main>
    </>
    
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type','posts')
  ],{
    fetch:['posts.title','posts.subtitle','posts.author'],
    pageSize:1
  });


  const posts:Post[] = postsResponse.results.map(post => {
    return{
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data
    }
  })

  return {
    props:{
      postsPagination:{
        results:posts,
        next_page:postsResponse.next_page
      }
    }
  }
  
};
