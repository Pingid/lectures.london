#!/usr/bin/env node

import { command, run, string, option } from 'cmd-ts'
import * as github from '@actions/github'
import * as path from 'path'
import * as fs from 'fs'

const app = command({
  name: 'artifact',
  args: {
    token: option({
      long: 'token',
      short: 't',
      type: string,
      description: 'Github access token',
    }),
    owner: option({
      long: 'owner',
      short: 'o',
      type: string,
      description: 'Repo owner',
    }),
    repo: option({
      long: 'repo',
      short: 'r',
      type: string,
      description: 'Repo name',
    }),
    name: option({
      long: 'name',
      short: 'n',
      type: string,
      description: 'artifact name',
    }),
    dest: option({
      long: 'dest',
      short: 'n',
      type: string,
      description: 'artifact dest',
    }),
  },
  handler: async (arg) => {
    const octokit = github.getOctokit(arg.token)

    const result = await octokit.rest.actions.listArtifactsForRepo({ owner: arg.owner, repo: arg.repo, per_page: 1000 })
    const artifact = result.data.artifacts.filter((x) => !x.expired).filter((x) => x.name === arg.name)?.[0]

    if (!artifact?.id) throw new Error(`Cant find any artifacts matching name`)

    const res = await octokit.rest.actions.downloadArtifact({
      artifact_id: artifact.id,
      archive_format: 'zip',
      owner: arg.owner,
      repo: arg.repo,
    })

    console.log('Downloading artifact to', path.join(process.cwd(), arg.dest, `${arg.name}.zip`))

    fs.writeFileSync(path.join(process.cwd(), arg.dest, `${arg.name}.zip`), Buffer.from(res.data as any))

    // // Delete github action runs
    // const runs = await octokit.rest.actions.listWorkflowRunsForRepo({
    //   owner: arg.owner,
    //   repo: arg.repo,
    //   per_page: 1000,
    // })

    // for (let i in runs.data.workflow_runs) {
    //   const run = runs.data.workflow_runs[i]
    //   console.log(`${i}/${runs.data.total_count}`)
    //   await octokit.rest.actions.deleteWorkflowRun({ owner: arg.owner, repo: arg.repo, run_id: run.id })
    // }
  },
})
run(app, process.argv.slice(2))
