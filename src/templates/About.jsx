import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/Layout"
import SEO from "../components/SEO"
import Bio from "../components/Bio"
import VerticalSpace from "../components/VerticalSpace"
import Article from "../components/Article"
import Comment from "../components/Article/Footer/Comment"
import Tab from "../components/Tab"

import NotFoundPage from "../pages/404"

import styled from "styled-components"

import { title, description, siteUrl, useAbout } from "../../blog-config"
import Divider from "../components/Divider"

const ArticleTitle = styled.h1`
  margin-bottom: 30px;
  line-height: 1.2;
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`

const Wrapper = styled.div`
  @media (max-width: 768px) {
    padding: 0 15px;
  }
`

const AboutTemplate = ({ data, children }) => {
  const aboutPost = data.mdx
  const postsCount = data.allMdx.totalCount

  if (!useAbout) return <NotFoundPage />

  return (
    <Layout>
      <SEO title={title} description={description} url={siteUrl} />
      <VerticalSpace size={48} />
      <Bio />
      <Tab postsCount={postsCount} activeTab="about" />
      <Article>
        <Wrapper>
          <ArticleTitle>
            {aboutPost?.frontmatter?.title || "About"}
          </ArticleTitle>
        </Wrapper>
        <Article.Body>
          {children}
        </Article.Body>
        <Wrapper>
          <Divider />
          <Comment />
        </Wrapper>
      </Article>
    </Layout>
  )
}

export default AboutTemplate

export const pageQuery = graphql`
  query {
    mdx(internal: { contentFilePath: { regex: "/contents/about/" } }) {
      frontmatter {
        title
      }
    }
    allMdx(
      filter: { internal: { contentFilePath: { regex: "/contents/posts/" } } }
    ) {
      totalCount
    }
  }
`