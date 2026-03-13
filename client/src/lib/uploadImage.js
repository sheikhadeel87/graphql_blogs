import { client } from './apollo'
import { SINGLE_UPLOAD } from '../graphql/mutations'

export async function uploadImage(file) {
  const { data } = await client.mutate({
    mutation: SINGLE_UPLOAD,
    variables: { file },
  })
  if (!data?.singleUpload) throw new Error('Upload failed')
  return data.singleUpload
}
