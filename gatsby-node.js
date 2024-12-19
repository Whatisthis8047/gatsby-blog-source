const { createFilePath } = require(`gatsby-source-filesystem`)
const _ = require("lodash")


exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const postTemplate = require.resolve(`./src/templates/Post.jsx`)
  const seriesTemplate = require.resolve(`./src/templates/Series.jsx`)
  const aboutTemplate = require.resolve(`./src/templates/About.jsx`)

  const result = await graphql(`
    {
      postsMdx: allMdx(
        sort: { frontmatter: { date: ASC }}
        filter: {
          internal: { contentFilePath: { regex: "/contents/posts/" } }
        }
        limit: 1000
      ) {
        nodes {
          id
          fields {
            slug
          }
          internal {
            contentFilePath
          }
          frontmatter {
            title
            description
            date
            series
            draft
            tags
          }
        }
      }
      tagsGroup: allMdx(limit: 2000) {
        group(field: { frontmatter: { tags: SELECT } }) {
          fieldValue
        }
      }
      about: mdx(internal: { contentFilePath: { regex: "/contents/about/" } }) {
        internal {
          contentFilePath
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const posts = result.data.postsMdx.nodes

  const series = _.reduce(
    posts,
    (acc, cur) => {
      const seriesName = cur.frontmatter.series
      if (seriesName && !_.includes(acc, seriesName))
        return [...acc, seriesName]
      return acc
    },
    []
  )

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: `${postTemplate}?__contentFilePath=${post.internal.contentFilePath}`,
        context: {
          id: post.id,
          series: post.frontmatter.series,
          previousPostId,
          nextPostId,
        },
      })
    })
  }

  if (series.length > 0) {
    series.forEach(singleSeries => {
      const path = `/series/${_.replace(singleSeries, /\s/g, "-")}`
      createPage({
        path,
        component: seriesTemplate,
        context: {
          series: singleSeries,
        },
      })
    })
  }
  if (result.data.about) {
    createPage({
      path: '/about',
      component: `${aboutTemplate}?__contentFilePath=${result.data.about.internal.contentFilePath}`,
      context: {},
    })
  }
}


exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Mdx`) {
    const slug = createFilePath({ node, getNode })
    const newSlug = `/${slug.split("/").reverse()[1]}/`

    createNodeField({
      node,
      name: `slug`,
      value: newSlug,
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
  type Mdx implements Node {
    frontmatter: Frontmatter!
  }
  type Frontmatter {
    title: String!
    description: String
    date: Date! @dateformat
    update: Date @dateformat
    tags: [String!]!
    series: String
    draft: Boolean
  }
  `
  createTypes(typeDefs)
}
