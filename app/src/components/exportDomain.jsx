const exportDomain = () => {
  const { NEXT_PUBLIC_ENVIRONMENT, NEXTAUTH_URL, PROD_DOMAIN } = process.env
  return NEXT_PUBLIC_ENVIRONMENT === "dev" ? NEXTAUTH_URL : PROD_DOMAIN
}
export default exportDomain
