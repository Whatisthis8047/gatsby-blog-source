import React from "react"
import _ from "lodash"
import { graphql } from "gatsby"

import Layout from "components/Layout"
import SEO from "components/SEO"
import Bio from "components/Bio"
import PostList from "components/PostList"
import SideTagList from "components/SideTagList"
import VerticalSpace from "components/VerticalSpace"
import Tab from "components/Tab"

import { title, description, siteUrl } from "../../blog-config"

const BlogIndex = ({ data }) => {
  // 환경에 따라 포스트 필터링
  const allPosts = data.allMdx.nodes
  const posts = process.env.NODE_ENV === 'production'
    ? allPosts.filter(post => !post.frontmatter.draft)
    : allPosts

  const tags = _.sortBy(data.allMdx.group, ["totalCount"]).reverse()

  if (posts.length === 0) {
    return (
      <p>
        No blog posts found. Add markdown posts to &quot;content/blog&quot; (or
        the directory you specified for the &quot;gatsby-source-filesystem&quot;
        plugin in gatsby-config.js).
      </p>
    )
  }

  return (
    <Layout>
      <SEO title={title} description={description} url={siteUrl} />
      <VerticalSpace size={48} />
      <Bio />
      <Tab postsCount={posts.length} activeTab="posts" />
      <SideTagList tags={tags} postCount={posts.length} />
      <PostList postList={posts} />
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        internal: { contentFilePath: { regex: "/contents/posts/" } }
      }
    ) {
      group(field: { frontmatter: { tags: SELECT } }) {
        fieldValue
        totalCount
      }
      nodes {
        excerpt(pruneLength: 200)
        fields {
          slug
        }
        frontmatter {
          description
          date(formatString: "MMMM DD, YYYY")
          update(formatString: "MMM DD, YYYY")
          title
          tags
          draft
        }
      }
    }
  }
`